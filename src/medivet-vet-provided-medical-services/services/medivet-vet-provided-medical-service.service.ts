import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetVetSpecializationMedicalServiceService } from "@/medivet-specializations/services/medivet-vet-specialization-medical-service.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetCreateVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-create-vet-provided-medical-service.dto";
import { MedivetSearchVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-search-vet-provided-medical-service.dto";
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
        vet: MedivetUser
    ): Promise<MedivetVetProvidedMedicalService[]> {
        const { include, specializationIds } = searchVetProvidedMedicalServiceDto;
        let vetProvidedMedicalServices = await this.vetProvidedMedicalServicesRepository.find({
            where: {
                user: { id: vet.id },
                clinic: { id: clinicId }
            },
            relations: include ?? []
        });

        if (specializationIds && specializationIds.length > 0) {
            console.log(vetProvidedMedicalServices);
            vetProvidedMedicalServices = vetProvidedMedicalServices.filter(vetProvidedMedicalService => {
                const vetProvidedMedicalServiceSpecializationIds = (vetProvidedMedicalService?.medicalService?.specializations || []).map(specialization => specialization.id);
                if (vetProvidedMedicalServiceSpecializationIds.find(id => specializationIds.includes(id))) return vetProvidedMedicalService;
            });
        }

        return paginateData(vetProvidedMedicalServices, {
            offset: searchVetProvidedMedicalServiceDto.offset,
            pageSize: searchVetProvidedMedicalServiceDto.pageSize
        });
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
