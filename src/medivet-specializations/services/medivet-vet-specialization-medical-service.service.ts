import { ErrorMessagesConstants } from '@/medivet-commons/constants/error-messages.constants';
import { MedivetCreateVetSpecializationMedicalServiceDto } from '@/medivet-specializations/dto/medivet-create-vet-specialization-medical-service.dto';
import { MedivetSearchVetSpecializationMedicalServiceDto } from '@/medivet-specializations/dto/medivet-search-vet-specialization-medical-service.dto';
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from "typeorm";

@Injectable()
export class MedivetVetSpecializationMedicalServiceService {
    constructor(
        @InjectRepository(MedivetVetSpecializationMedicalService) private vetSpecializationMedicalServiceRepository: Repository<MedivetVetSpecializationMedicalService>,
        @InjectRepository(MedivetVetSpecialization) private vetSpecializationRepository: Repository<MedivetVetSpecialization>,
        @InjectRepository(MedivetUser) private userRepository: Repository<MedivetUser>,
    ) { }

    private async getVetSpecializationsToAssign(specializationIds: number[]): Promise<MedivetVetSpecialization[]> {
        const existingSpecializations = await this.vetSpecializationRepository.find();
        const existingSpecializationIds = existingSpecializations.map(({ id }) => id);

        if (!specializationIds.every(specializationId => existingSpecializationIds.includes(specializationId))) {
            throw new BadRequestException([ErrorMessagesConstants.ONE_OF_THE_VET_SPECIALIZATION_DOES_NOT_EXIST]);
        }

        return existingSpecializations.filter(({ id }) => specializationIds.includes(id));
    }

    async createVetSpecializationMedicalService(createVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto): Promise<MedivetVetSpecializationMedicalService> {
        const { name, specializationIds } = createVetSpecializationMedicalServiceDto;

        if (await this.checkIfVetSpecializationMedicalServiceAlreadyExists(createVetSpecializationMedicalServiceDto)) {
            throw new BadRequestException([ErrorMessagesConstants.VET_SPECIALIZATION_MEDICAL_SERVICE_ALREADY_EXISTS]);
        };

        const existingSpecializations = await this.vetSpecializationRepository.find();
        const existingSpecializationIds = existingSpecializations.map(({ id }) => id);

        if (!specializationIds.every(specializationId => existingSpecializationIds.includes(specializationId))) {
            throw new BadRequestException([ErrorMessagesConstants.ONE_OF_THE_VET_SPECIALIZATION_DOES_NOT_EXIST]);
        }

        const specializations = await this.getVetSpecializationsToAssign(specializationIds);

        const newVetSpecializationMedicalService = this.vetSpecializationMedicalServiceRepository.create({
            name,
            specializations
        });
        await this.vetSpecializationMedicalServiceRepository.save(newVetSpecializationMedicalService);
        return newVetSpecializationMedicalService;
    }

    private async checkIfVetSpecializationMedicalServiceAlreadyExists(createVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto): Promise<boolean> {
        const { name } = createVetSpecializationMedicalServiceDto;
        const vetSpecializationMedicalService = await this.vetSpecializationMedicalServiceRepository.findOne({ where: { name } });
        return !!vetSpecializationMedicalService;
    }

    async searchVetSpecializationMedicalServices(searchVetSpecializationMedicalServiceDto: MedivetSearchVetSpecializationMedicalServiceDto): Promise<MedivetVetSpecializationMedicalService[]> {
        const pageSize = searchVetSpecializationMedicalServiceDto.pageSize || 10;
        const offset = searchVetSpecializationMedicalServiceDto.offset || 0;
        const search = searchVetSpecializationMedicalServiceDto?.search || '';

        return this.vetSpecializationMedicalServiceRepository.find({
            take: pageSize,
            skip: offset,
            where: { name: search ? ILike(`%${search}%`) : Not('') },
            relations: searchVetSpecializationMedicalServiceDto.include ?? []
        });
    }

    async findOneVetSpecializationMedicalServiceById(id: number, include?: string[]): Promise<MedivetVetSpecializationMedicalService> {
        const vetSpecializationMedicalService = await this.vetSpecializationMedicalServiceRepository.findOne({
            where: { id },
            relations: include ?? []
        });
        if (!vetSpecializationMedicalService) throw new NotFoundException(ErrorMessagesConstants.VET_SPECIALIZATION_MEDICAL_SERVICE_WITH_THIS_ID_DOES_NOT_EXIST);
        return vetSpecializationMedicalService;
    }

    async removeVetSpecializationMedicalService(id: number): Promise<void> {
        const vetSpecializationMedicalService = await this.findOneVetSpecializationMedicalServiceById(id, ['specializations']);

        const vetSpecializationMedicalServiceInUse = await this.checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService);

        if (vetSpecializationMedicalServiceInUse) {
            throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_MEDICAL_SERVICE_WHICH_IS_IN_USE]);
        }
        this.vetSpecializationMedicalServiceRepository.remove(vetSpecializationMedicalService);
    }

    private async checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService: MedivetVetSpecializationMedicalService): Promise<boolean> {
        const vetSpecializationIds = (await this.userRepository.find({
            relations: [
                'specializations'
            ]
        })).filter(user => user.role === MedivetUserRole.VET).flatMap(v => v.specializations).map(s => s.id);
        const serviceSpecializationsIds = vetSpecializationMedicalService.specializations.flatMap(s => s.id);

        return serviceSpecializationsIds.some(specializationId => vetSpecializationIds.includes(specializationId));
    };


    async updateVetSpecializationMedicalService(
        vetSpecializationMedicalServiceId: number,
        updateVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto,
        include?: string[]
    ): Promise<MedivetVetSpecializationMedicalService> {
        const vetSpecializationMedicalService = await this.findOneVetSpecializationMedicalServiceById(vetSpecializationMedicalServiceId, include);
        const { name, specializationIds } = updateVetSpecializationMedicalServiceDto;

        if (vetSpecializationMedicalService) {
            const vetSpecializationMedicalServiceInUse = await this.checkIfVetSpecializationMedicalServiceIsInUse(vetSpecializationMedicalService);
            // sprawdzić czy ta usługa z przypisana specjalizacja jest juz przypisana do jakiegoś weterynarza -> jezeli tak to nie moze wywalić specjalizacji z usługi 
            if (vetSpecializationMedicalServiceInUse) {
                throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_FROM_MEDICAL_SERVICE_WHICH_IS_IN_USE]);
            }

            const specializations = await this.getVetSpecializationsToAssign(specializationIds);

            vetSpecializationMedicalService.name = name;
            vetSpecializationMedicalService.specializations = [...specializations];

            await this.vetSpecializationMedicalServiceRepository.save(vetSpecializationMedicalService);
            return vetSpecializationMedicalService;

        }
    }
}