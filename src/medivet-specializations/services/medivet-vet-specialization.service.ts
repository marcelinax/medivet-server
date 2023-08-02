import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetCreateVetSpecializationDto } from "@/medivet-specializations/dto/medivet-create-vet-specialization.dto";
import { MedivetSearchVetSpecializationDto } from "@/medivet-specializations/dto/medivet-search-vet-specialization.dto";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Injectable()
export class MedivetVetSpecializationService {
    constructor(
    @InjectRepository(MedivetVetSpecialization) private vetSpecializationRepository: Repository<MedivetVetSpecialization>,
    @InjectRepository(MedivetUser) private userRepository: Repository<MedivetUser>
    ) {
    }

    async createVetSpecialization(createVetSpecializationDto: MedivetCreateVetSpecializationDto): Promise<MedivetVetSpecialization> {
        if (await this.checkIfVetSpecializationAlreadyExists(createVetSpecializationDto)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.VET_SPECIALIZATION_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        const newVetSpecialization = this.vetSpecializationRepository.create({ name: createVetSpecializationDto.name, });
        await this.vetSpecializationRepository.save(newVetSpecialization);
        return newVetSpecialization;
    }

    async findOneVetSpecializationById(id: number): Promise<MedivetVetSpecialization> {
        const vetSpecialization = await this.vetSpecializationRepository.findOne({ where: { id } });
        if (!vetSpecialization) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.VET_SPECIALIZATION_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }
        return vetSpecialization;
    }

    async removeVetSpecialization(vetSpecializationId: number): Promise<void> {
        const vetSpecialization = await this.findOneVetSpecializationById(vetSpecializationId);

        if (vetSpecialization) {
            const vetSpecializationInUse = await this.checkIfVetSpecializationIsInUse(vetSpecializationId);
            if (vetSpecializationInUse) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_WHICH_IS_IN_USE,
                        property: "all"
                    }
                ]);
            }
            this.vetSpecializationRepository.remove(vetSpecialization);
        }
    }

    async updateVetSpecialization(vetSpecializationId: number, updateVetSpecializationDto: MedivetCreateVetSpecializationDto): Promise<MedivetVetSpecialization> {
        const vetSpecialization = await this.findOneVetSpecializationById(vetSpecializationId);
        const { name } = updateVetSpecializationDto;

        if (vetSpecialization) {
            vetSpecialization.name = name;

            await this.vetSpecializationRepository.save(vetSpecialization);
            return vetSpecialization;
        }
    }

    async searchVetSpecialization(searchVetSpecializationDto: MedivetSearchVetSpecializationDto): Promise<MedivetVetSpecialization[]> {
        const pageSize = searchVetSpecializationDto.pageSize || 10;
        const offset = searchVetSpecializationDto.offset || 0;
        const search = searchVetSpecializationDto?.search || "";

        return this.vetSpecializationRepository.find({
            take: pageSize,
            skip: offset,
            where: { name: search ? ILike(`%${search}%`) : Not("") }
        });
    }

    private async checkIfVetSpecializationAlreadyExists(createVetSpecializationDto: MedivetCreateVetSpecializationDto): Promise<boolean> {
        const { name } = createVetSpecializationDto;
        const existingVetSpecialization = await this.vetSpecializationRepository.findOne({ where: { name, } });

        if (!existingVetSpecialization) return false;
        return true;
    }

    private async checkIfVetSpecializationIsInUse(vetSpecializationId: number): Promise<boolean> {
        const vetSpecialization = this.userRepository.findOne({ where: { specializations: { id: vetSpecializationId } } });
        return !!vetSpecialization;
    };

}
