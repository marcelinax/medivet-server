import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { Repository } from 'typeorm';
import medivetVetSpecializationsDataset from '@/medivet-users/datasets/medivet-vet-specializations.dataset.json';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";


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

    async getAllVetSpecialization(): Promise<MedivetVetSpecialization[]> {
        return this.medivetVetSpecializationRepository.find();
    }

    async searchVetSpecialization(query: string): Promise<MedivetVetSpecialization[]> {
        return this.medivetVetSpecializationRepository.createQueryBuilder('medivet-vet-specialization').
            where('medivet-vet-specialization.namePl = :q', { q: query }).getMany();
    }

    async findVetSpecializationById(id: number): Promise<MedivetVetSpecialization> {
        const specialization = await this.medivetVetSpecializationRepository.findOne({ where: { id } });

        if (!specialization) throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_DOES_NOT_EXIST]);
        return specialization;
    }

}