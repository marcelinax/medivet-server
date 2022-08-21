import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
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

    validateAnimalBirthDate(animal: MedivetCreateAnimalDto): void {
        const { birthDate } = animal;

        if(birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

}