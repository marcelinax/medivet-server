import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetAnimalBreed } from '@/medivet-animals/entities/medivet-animal-breed.entity';
import { Repository } from "typeorm";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetCreateAnimalBreedDto } from "@/medivet-animals/dto/medivet-create-animal-breed.dto";
import { MedivetAnimal } from '@/medivet-animals/entities/medivet-animal.entity';
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Injectable()
export class MedivetAnimalsBreedsService {
    constructor(
        @InjectRepository(MedivetAnimalBreed) private animalBreedRepository: Repository<MedivetAnimalBreed>,
        @InjectRepository(MedivetAnimal) private animalRepository: Repository<MedivetAnimal>
    ) { }
    
    async createAnimalBreed(createAnimalBreedDto: MedivetCreateAnimalBreedDto, user: MedivetUser): Promise<MedivetAnimalBreed> {
        const { name } = createAnimalBreedDto;

        const existingAnimalBreed = await this.findOneAnimalBreedByName(name);
        if (existingAnimalBreed) throw new BadRequestException([ErrorMessagesConstants.ANIMAL_BREED_WITH_THIS_NAME_ALREADY_EXISTS]);

        const newAnimalBreed = this.animalBreedRepository.create({
            name: this.parseAnimalBreedToPascalCase(name),
            user,
            used: false
        });
        await this.animalBreedRepository.save(newAnimalBreed);
        return newAnimalBreed;
}

    async findOneAnimalBreedById(id: number): Promise<MedivetAnimalBreed> {
        const breed = await this.animalBreedRepository.findOne({ where: { id } , relations: ['user']});
        if (!breed) throw new NotFoundException([ErrorMessagesConstants.ANIMAL_BREED_WITH_THIS_ID_DOES_NOT_EXIST]);
        return breed;
    }

    async findOneAnimalBreedByName(name: string): Promise<MedivetAnimalBreed> {
        return this.animalBreedRepository.findOne({ where: { name }, relations: ['user'] });
    }

    parseAnimalBreedToPascalCase(breed: string): string {
        const words = breed.split(' ');
        return words.map(word => {
            const firstLetter = word[0].toUpperCase();
            const restLetters = word.slice(1);
            return firstLetter + restLetters;
        }).join(' ');
    }

    async checkIfAnimalBreedIsUsed(breed: string): Promise<boolean> {
        const animalWithThisBreed = await this.animalRepository.findOne({ where: { breed } });
        return !!animalWithThisBreed;
    }

    async updateAnimalBreedUsage(breedName: string, isUsed: boolean) : Promise<MedivetAnimalBreed> {
        const breed = await this.findOneAnimalBreedByName(breedName);
        breed.used = isUsed;
        await this.animalBreedRepository.save(breed);
        return breed;
    }

}