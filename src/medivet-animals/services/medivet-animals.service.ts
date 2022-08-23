import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

@Injectable()
export class MedivetAnimalsService {
    constructor(
        @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>
    ) { }
    
    async createAnimal(createAnimalDto: MedivetCreateAnimalDto, owner: MedivetUser): Promise<MedivetAnimal> {

        const newAnimal = this.animalsRepository.create({
            name: createAnimalDto.name,
            birthDate: createAnimalDto.birthDate,
            breed: this.parseAnimalBreedToPascalCase(createAnimalDto.breed),
            gender: createAnimalDto.gender,
            type: createAnimalDto.type,
            coatColor: createAnimalDto.coatColor,
            owner
        });
        await this.animalsRepository.save(newAnimal);
        return newAnimal;
    }

    async findOneAnimalById(id: number): Promise<MedivetAnimal> {
        const animal = await this.animalsRepository.findOne({ where: { id }, relations: ['owner'] });
        if (!animal) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST);
        return animal;
    }

    validateAnimalBirthDate(animal: MedivetCreateAnimalDto): void {
        const { birthDate } = animal;

        if(birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

    parseAnimalBreedToPascalCase(breed: string): string {
        const words = breed.split(' ');
        return words.map(word => {
            const firstLetter = word[0].toUpperCase();
            const restLetters = word.slice(1);
            return firstLetter + restLetters;
        }).join(' ');
    }

    async updateAnimal(animalId: number, user: MedivetUser, updateAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
        const animal = await this.findOneAnimalById(animalId);
        const { birthDate, breed, coatColor, gender, name, type } = updateAnimalDto;

        if (!this.checkIfUserIsAnimalOwner(user, animal)) throw new UnauthorizedException();

        animal.birthDate = birthDate;
        animal.breed = breed;
        animal.coatColor = coatColor;
        animal.gender = gender;
        animal.name = name;
        animal.type = type;

        await this.animalsRepository.save(animal);
        return animal;
    }

    checkIfUserIsAnimalOwner(user: MedivetUser, animal: MedivetAnimal): boolean {
        return user.id === animal.owner.id;
    }

}