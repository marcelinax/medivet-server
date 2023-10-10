import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetVetSpecializationMedicalServiceService } from "@/medivet-specializations/services/medivet-vet-specialization-medical-service.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetCreateVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-create-vet-provided-medical-service.dto";
import { MedivetSearchVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-search-vet-provided-medical-service.dto";
import { MedivetUpdateVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-update-vet-provided-medical-service.dto";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";

@Injectable()
export class MedivetVetProvidedMedicalServiceService {
    constructor(
    @InjectRepository(MedivetVetProvidedMedicalService) private vetProvidedMedicalServicesRepository: Repository<MedivetVetProvidedMedicalService>,
    private specializationMedicalServicesService: MedivetVetSpecializationMedicalServiceService,
    private clinicsService: MedivetClinicsService
    ) {
    }

    async createVetProvidedMedicalService(
        createVetProvidedMedicalServiceDto: MedivetCreateVetProvidedMedicalServiceDto,
        vet: MedivetUser
    ): Promise<MedivetVetProvidedMedicalService> {
        const { specializationMedicalServiceId, price, clinicId, duration } = createVetProvidedMedicalServiceDto;

        const existingVetProvidedMedicalService = await this.checkIfVetProvidedMedicalServiceAlreadyExists(createVetProvidedMedicalServiceDto, vet);

        if (existingVetProvidedMedicalService) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CREATE_MORE_THAN_ONE_VET_PROVIDED_MEDICAL_SERVICE_FOR_SAME_SPECIALIZATION_IN_ONE_CLINIC,
                    property: "all"
                }
            ]);
        }

        const medicalService = await this.specializationMedicalServicesService.findOneVetSpecializationMedicalServiceById(specializationMedicalServiceId);
        const clinic = await this.clinicsService.findClinicById(clinicId);

        const newVetProvidedMedicalService = await this.vetProvidedMedicalServicesRepository.create({
            medicalService,
            clinic,
            user: vet,
            duration,
            price,
        });

        await this.vetProvidedMedicalServicesRepository.save(newVetProvidedMedicalService);
        return newVetProvidedMedicalService;
    }

    async updateVetProvidedMedicalService(
        vetProvidedMedicalServiceId: number,
        updateVetProvidedMedicalServiceDto: MedivetUpdateVetProvidedMedicalServiceDto,
    ): Promise<MedivetVetProvidedMedicalService> {
        const { price, duration } = updateVetProvidedMedicalServiceDto;
        const vetProvidedMedicalService = await this.findVetProvidedMedicalServiceById(vetProvidedMedicalServiceId);

        vetProvidedMedicalService.duration = duration;
        vetProvidedMedicalService.price = price;

        await this.vetProvidedMedicalServicesRepository.save(vetProvidedMedicalService);
        return vetProvidedMedicalService;
    }

    async findVetProvidedMedicalServiceById(providedMedicalServiceId: number, include?: string[]): Promise<MedivetVetProvidedMedicalService> {
        const providedMedicalService = await this.vetProvidedMedicalServicesRepository.findOne({
            where: { id: providedMedicalServiceId },
            relations: include ?? []
        });

        if (!providedMedicalService) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.VET_PROVIDED_MEDICAL_SERVICE_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }

        return providedMedicalService;
    }

    async searchVetProvidedMedicalServicesForClinic(
        clinicId: number,
        searchVetProvidedMedicalServiceDto: MedivetSearchVetProvidedMedicalServiceDto,
    ): Promise<MedivetVetProvidedMedicalService[]> {
        const { include, specializationIds, vetId } = searchVetProvidedMedicalServiceDto;
        let vetProvidedMedicalServices = await this.vetProvidedMedicalServicesRepository.find({
            where: {
                user: { id: vetId },
                clinic: { id: clinicId }
            },
            relations: include ?? []
        });

        if (specializationIds && specializationIds.length > 0) {
            vetProvidedMedicalServices = vetProvidedMedicalServices.filter(vetProvidedMedicalService => specializationIds.includes(vetProvidedMedicalService.medicalService.specialization.id));
        }

        vetProvidedMedicalServices.sort((a, b) => a.medicalService.name.localeCompare(b.medicalService.name));

        return paginateData(vetProvidedMedicalServices, {
            offset: searchVetProvidedMedicalServiceDto.offset,
            pageSize: searchVetProvidedMedicalServiceDto.pageSize
        });
    }

    async getAllVetProvidedMedicalServices(offsetPaginationDto: OffsetPaginationDto, include?: string[]): Promise<MedivetVetProvidedMedicalService[]> {
        const vetProvidedMedicalServices = await this.vetProvidedMedicalServicesRepository.find({ relations: include ?? [] });
        return paginateData(vetProvidedMedicalServices, {
            offset: offsetPaginationDto.offset,
            pageSize: offsetPaginationDto.pageSize
        });
    }

    async removeVetProvidedMedicalService(vetProvidedMedicalServiceId: number): Promise<OkMessageDto> {
        const vetProvidedMedicalService = await this.findVetProvidedMedicalServiceById(vetProvidedMedicalServiceId);
        await this.vetProvidedMedicalServicesRepository.remove(vetProvidedMedicalService);

        return { message: SuccessMessageConstants.VET_CLINIC_PROVIDED_MEDICAL_SERVICE_HAS_BEEN_REMOVED_SUCCESSFULLY };
    }

    private async checkIfVetProvidedMedicalServiceAlreadyExists(
        createVetProvidedMedicalServiceDto: MedivetCreateVetProvidedMedicalServiceDto,
        vet: MedivetUser
    ): Promise<boolean> {
        const { specializationMedicalServiceId, clinicId } = createVetProvidedMedicalServiceDto;
        const existingVetProvidedMedicalService = await this.vetProvidedMedicalServicesRepository.findOne({
            where: {
                clinic: { id: clinicId },
                user: { id: vet.id },
                medicalService: { id: specializationMedicalServiceId },
            },
            relations: [ "clinic", "user", "medicalService" ]
        });

        return !!existingVetProvidedMedicalService;
    }
}
