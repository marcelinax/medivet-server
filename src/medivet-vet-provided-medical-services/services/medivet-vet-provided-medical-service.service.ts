import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetAvailableDatesService } from "@/medivet-available-dates/services/medivet-available-dates.service";
import { MedivetAvailableDate } from "@/medivet-available-dates/types/types";
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
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
    private clinicsService: MedivetClinicsService,
    @Inject(forwardRef(() => MedivetAvailableDatesService)) private availableDatesService: MedivetAvailableDatesService
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

    async findVetProvidedMedicalServiceById(providedMedicalServiceId: number, include?: string): Promise<MedivetVetProvidedMedicalService> {
        const providedMedicalService = await this.vetProvidedMedicalServicesRepository.findOne({
            where: { id: providedMedicalServiceId },
            relations: include?.split(",") ?? []
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
        const { include, specializationIds, vetId, medicalServiceIds, sorting } = searchVetProvidedMedicalServiceDto;

        let vetProvidedMedicalServices = await this.vetProvidedMedicalServicesRepository.find({
            where: {
                user: { id: vetId },
                clinic: { id: clinicId },
            },
            relations: include?.split(",") ?? []
        });

        if (specializationIds && specializationIds.length > 0) {
            vetProvidedMedicalServices = vetProvidedMedicalServices.filter(vetProvidedMedicalService => specializationIds.includes(vetProvidedMedicalService.medicalService.specialization.id));
        }

        if (medicalServiceIds && medicalServiceIds.length > 0) {
            vetProvidedMedicalServices = vetProvidedMedicalServices.filter(vetProvidedMedicalService => medicalServiceIds.includes(vetProvidedMedicalService.medicalService.id));
        }

        switch (sorting) {
            case MedivetSortingModeEnum.DESC: {
                const copiedVetProvidedMedicalServices = [ ...vetProvidedMedicalServices ];
                vetProvidedMedicalServices = await this.getSortedVetProvidedMedicalServicesByNearestAvailability(copiedVetProvidedMedicalServices);
                break;
            }
            default:
                vetProvidedMedicalServices.sort((a, b) => a.medicalService.name.localeCompare(b.medicalService.name));
                break;
        }

        return paginateData(vetProvidedMedicalServices, {
            offset: searchVetProvidedMedicalServiceDto.offset,
            pageSize: searchVetProvidedMedicalServiceDto.pageSize
        });
    }

    async getAllVetProvidedMedicalServices(offsetPaginationDto: OffsetPaginationDto, include?: string): Promise<MedivetVetProvidedMedicalService[]> {
        const vetProvidedMedicalServices = await this.vetProvidedMedicalServicesRepository.find({ relations: include?.split(",") ?? [] });
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

    async getProvidedMedicalServicesForVet(
        vetId: number,
        include?: string
    ): Promise<MedivetVetProvidedMedicalService[]> {
        return this.vetProvidedMedicalServicesRepository.find({
            where: { user: { id: vetId }, },
            relations: include?.split(",") ?? []
        });
    }

    private async getSortedVetProvidedMedicalServicesByNearestAvailability(
        vetProvidedMedicalServices: MedivetVetProvidedMedicalService[]
    ): Promise<MedivetVetProvidedMedicalService[]> {
        const providedMedicalServicesWithNearestAvailability: {
      vetProvidedMedicalService: MedivetVetProvidedMedicalService;
      date: MedivetAvailableDate;
    }[] = [];
        for (const vetProvidedMedicalService of vetProvidedMedicalServices) {
            const nearestAvailableDate = await this.availableDatesService.getFirstAvailableDateForMedicalService(vetProvidedMedicalService.user.id, vetProvidedMedicalService.id);
            if (nearestAvailableDate) {
                providedMedicalServicesWithNearestAvailability.push({
                    vetProvidedMedicalService,
                    date: nearestAvailableDate
                });
            }
        }
        providedMedicalServicesWithNearestAvailability.sort((a, b) => a.date.dates[0].getTime() - b.date.dates[0].getTime());
        return providedMedicalServicesWithNearestAvailability.map(providedMedicalService => providedMedicalService.vetProvidedMedicalService);
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
