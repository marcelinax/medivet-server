import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetCreateVetSpecializationMedicalServiceDto } from "@/medivet-specializations/dto/medivet-create-vet-specialization-medical-service.dto";
import { MedivetSearchVetSpecializationMedicalServiceDto } from "@/medivet-specializations/dto/medivet-search-vet-specialization-medical-service.dto";
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecializationService } from "@/medivet-specializations/services/medivet-vet-specialization.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@Injectable()
export class MedivetVetSpecializationMedicalServiceService {
    constructor(
    @InjectRepository(MedivetVetSpecializationMedicalService) private vetSpecializationMedicalServiceRepository: Repository<MedivetVetSpecializationMedicalService>,
    private vetSpecializationsService: MedivetVetSpecializationService,
    @InjectRepository(MedivetUser) private userRepository: Repository<MedivetUser>,
    ) {
    }

    async createVetSpecializationMedicalService(createVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto): Promise<MedivetVetSpecializationMedicalService> {
        const { name, specializationId } = createVetSpecializationMedicalServiceDto;

        if (await this.checkIfVetSpecializationMedicalServiceAlreadyExists(createVetSpecializationMedicalServiceDto)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.VET_SPECIALIZATION_MEDICAL_SERVICE_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        const specialization = await this.vetSpecializationsService.findOneVetSpecializationById(specializationId);

        const newVetSpecializationMedicalService = this.vetSpecializationMedicalServiceRepository.create({
            name,
            specialization
        });

        await this.vetSpecializationMedicalServiceRepository.save(newVetSpecializationMedicalService);
        return newVetSpecializationMedicalService;
    }

    async searchVetSpecializationMedicalServices(searchVetSpecializationMedicalServiceDto: MedivetSearchVetSpecializationMedicalServiceDto): Promise<MedivetVetSpecializationMedicalService[]> {
        const pageSize = searchVetSpecializationMedicalServiceDto.pageSize || 10;
        const offset = searchVetSpecializationMedicalServiceDto.offset || 0;
        const search = searchVetSpecializationMedicalServiceDto?.search || "";
        const specializationIds = [ ...(searchVetSpecializationMedicalServiceDto?.specializationIds) || [] ];
        let vetSpecializationMedicalServices: MedivetVetSpecializationMedicalService[] = [];

        vetSpecializationMedicalServices = [
            ...await this.vetSpecializationMedicalServiceRepository.find({
                take: pageSize,
                skip: offset,
                where: { name: search ? ILike(`%${search}%`) : Not("") },
                relations: searchVetSpecializationMedicalServiceDto.include ?? []
            })
        ];

        if (specializationIds.length > 0) {
            vetSpecializationMedicalServices = vetSpecializationMedicalServices.filter(vetSpecializationMedicalService => specializationIds.includes(vetSpecializationMedicalService?.specialization?.id));
        }

        return vetSpecializationMedicalServices;
    }

    async findOneVetSpecializationMedicalServiceById(id: number, include?: string[]): Promise<MedivetVetSpecializationMedicalService> {
        const vetSpecializationMedicalService = await this.vetSpecializationMedicalServiceRepository.findOne({
            where: { id },
            relations: include ?? []
        });
        if (!vetSpecializationMedicalService) {
            throw new NotFoundException({
                message: ErrorMessagesConstants.VET_SPECIALIZATION_MEDICAL_SERVICE_WITH_THIS_ID_DOES_NOT_EXIST,
                property: "all"
            });
        }
        return vetSpecializationMedicalService;
    }

    async removeVetSpecializationMedicalService(id: number): Promise<OkMessageDto> {
        const vetSpecializationMedicalService = await this.findOneVetSpecializationMedicalServiceById(id, [ "specialization" ]);

        const vetSpecializationMedicalServiceInUse = await this.checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService);

        if (vetSpecializationMedicalServiceInUse) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_MEDICAL_SERVICE_WHICH_IS_IN_USE,
                    property: "all"
                }
            ]);
        }
        await this.vetSpecializationMedicalServiceRepository.remove(vetSpecializationMedicalService);
        return { message: SuccessMessageConstants.VET_SPECIALIZATION_MEDICAL_SERVICE_HAS_BEN_REMOVED_SUCCESSFULLY };
    }

    async updateVetSpecializationMedicalService(
        vetSpecializationMedicalServiceId: number,
        updateVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto,
        include?: string[]
    ): Promise<MedivetVetSpecializationMedicalService> {
        const vetSpecializationMedicalService = await this.findOneVetSpecializationMedicalServiceById(vetSpecializationMedicalServiceId, include);
        const { name, specializationId } = updateVetSpecializationMedicalServiceDto;

        if (vetSpecializationMedicalService) {
            const vetSpecializationMedicalServiceInUse = await this.checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService);
            if (vetSpecializationMedicalServiceInUse) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_FROM_MEDICAL_SERVICE_WHICH_IS_IN_USE,
                        property: "all"
                    }
                ]);
            }

            const specialization = await this.vetSpecializationsService.findOneVetSpecializationById(specializationId);

            vetSpecializationMedicalService.name = name;
            vetSpecializationMedicalService.specialization = { ...specialization };

            await this.vetSpecializationMedicalServiceRepository.save(vetSpecializationMedicalService);
            return vetSpecializationMedicalService;
        }
    }

    private async checkIfVetSpecializationMedicalServiceAlreadyExists(createVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto): Promise<boolean> {
        const { name, specializationId } = createVetSpecializationMedicalServiceDto;
        const vetSpecializationMedicalService = await this.vetSpecializationMedicalServiceRepository.findOne({
            where:
        {
            name,
            specialization: { id: specializationId }
        },
        });
        return !!vetSpecializationMedicalService;
    }

    private async checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService: MedivetVetSpecializationMedicalService): Promise<boolean> {
        const vetSpecializationIds = (await this.userRepository.find({ relations: [ "specializations" ] })).filter(user => user.role === MedivetUserRole.VET).flatMap(v => v.specializations).map(s => s.id);
        const serviceSpecializationsId = vetSpecializationMedicalService.specialization.id;

        return vetSpecializationIds.includes(serviceSpecializationsId);
    };
}
