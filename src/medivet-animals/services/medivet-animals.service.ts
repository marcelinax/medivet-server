import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

@Injectable()
export class MedivetAnimalsService {
    constructor(@InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>) { }
    
    async createAnimal(createAnimalDto: MedivetCreateAnimalDto, owner: MedivetUser): Promise<MedivetAnimal> {

        const newAnimal = this.animalsRepository.create({
            name: createAnimalDto.name,
            birthDate: createAnimalDto.birthDate,
            breed: createAnimalDto.breed,
            gender: createAnimalDto.gender,
            type: createAnimalDto.type,
            owner
        });
        await this.animalsRepository.save(newAnimal);
        return newAnimal;
    }

    async findOneById(id: number): Promise<MedivetAnimal> {
        const animal =  this.animalsRepository.findOne({ where: { id } });
        if (!animal) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST);
        return animal;
    }

    validateAnimalBirthDate(animal: MedivetCreateAnimalDto): void {
        const { birthDate } = animal;

        if(birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }
}