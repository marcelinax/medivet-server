import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import medivetVetSpecializationsDataset from '@/medivet-users/datasets/medivet-vet-specializations.dataset.json';
import { MedivetSearchVetSpecializationDto } from '@/medivet-users/dto/medivet-search-vet-specialization.dto';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from 'typeorm';

@Injectable()
export class MedivetVetSpecializationService {
    constructor(@InjectRepository(MedivetVetSpecialization) private medivetVetSpecializationRepository: Repository<MedivetVetSpecialization>) {
        this.synchronizeDataset();
    }

    async synchronizeDataset(): Promise<void> {
        const count = await this.medivetVetSpecializationRepository.count();
        if (count !== 0) return;
        medivetVetSpecializationsDataset?.forEach(async specialization => {
            await this.createVetSpecialization(specialization.id, specialization.namePl);
        });
    }

    async createVetSpecialization(id: number, namePl: string): Promise<MedivetVetSpecialization> {
        const vetSpecialization = this.medivetVetSpecializationRepository.create({
            id,
            namePl
        });
        await this.medivetVetSpecializationRepository.save(vetSpecialization);
        return vetSpecialization;
    }

    async searchVetSpecialization(searchVetSpecializationDto: MedivetSearchVetSpecializationDto): Promise<MedivetVetSpecialization[]> {
        const pageSize = searchVetSpecializationDto.pageSize || 20;
        const offset = searchVetSpecializationDto.offset || 0;
        const search = searchVetSpecializationDto?.search || '';

        return await this.medivetVetSpecializationRepository.find({
            take: pageSize,
            skip: offset,
            where: { namePl: search ? ILike(`%${search}%`) : Not('') }
        });
    }

    async findVetSpecializationById(id: number): Promise<MedivetVetSpecialization> {
        const specialization = await this.medivetVetSpecializationRepository.findOne({ where: { id } });

        if (!specialization) throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_DOES_NOT_EXIST]);
        return specialization;
    }

}