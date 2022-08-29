import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetStatusEnum } from "@/medivet-commons/enums/medivet-status.enum";
import { MedivetSearchAnimalDto } from '@/medivet-animals/dto/medivet-search-animal.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

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

    private validateAnimalBirthDate(animal: MedivetCreateAnimalDto): void {
        const { birthDate } = animal;

        if(birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

    private parseAnimalBreedToPascalCase(breed: string): string {
        const words = breed.split(' ');
        return words.map(word => {
            const firstLetter = word[0].toUpperCase();
            const restLetters = word.slice(1);
            return firstLetter + restLetters;
        }).join(' ');
    }

    async findOneAnimalById(id: number): Promise<MedivetAnimal> {
        const animal = await this.animalsRepository.findOne({ where: { id }, relations: ['owner'] });
        if (!animal) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST);
        return animal;
    }

    private async findAllAnimalsAssignedToOwner(user: MedivetUser): Promise<MedivetAnimal[]> {
        return this.animalsRepository.find({ where: {owner: {id: user.id}}, relations: ['owner'] });
    }

    async serachAllAnimalsAssignedToOwner(user: MedivetUser, searchAnimalDto: MedivetSearchAnimalDto): Promise<MedivetAnimal[]> {
        let animals = await this.findAllAnimalsAssignedToOwner(user);
        
        if (searchAnimalDto.animalName) {
            animals = animals.filter(animal => animal.name.toLowerCase().includes(searchAnimalDto.animalName.toLowerCase()));
        }

        if (searchAnimalDto.sortingMode) {
            animals = animals.sort((a, b) => {
                const aName: string = a.name.toLowerCase();
                const bName: string = b.name.toLowerCase();
                
                switch (searchAnimalDto.sortingMode) {
                    case MedivetSortingModeEnum.ASC:
                        return aName.localeCompare(bName);
                    case MedivetSortingModeEnum.DESC:
                            return bName.localeCompare(aName);
                }
            })
        }

        const pageSize = searchAnimalDto.pageSize || 10;
        const offset = searchAnimalDto.offset || 0;

        return this.paginateAnimals(offset, pageSize, animals);
    }

    private paginateAnimals(offset: number, pageSize: number, animals: MedivetAnimal[]): MedivetAnimal[] {
        return animals.filter((_, index) => index >= offset && index < offset + pageSize);
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

    async archiveAnimal(animal: MedivetAnimal, user: MedivetUser): Promise<MedivetAnimal> {
        if (animal.owner.id !== user.id) throw new UnauthorizedException([ErrorMessagesConstants.USER_IS_UNAUTHORIZED_TO_DO_THIS_ACTION]);

        animal.status = MedivetStatusEnum.ARCHIVED;
        await this.animalsRepository.save(animal);
        return animal;
    }

    async restoreAnimal(animal: MedivetAnimal, user: MedivetUser): Promise<MedivetAnimal> {
        if (animal.owner.id !== user.id) throw new UnauthorizedException([ErrorMessagesConstants.USER_IS_UNAUTHORIZED_TO_DO_THIS_ACTION]);
        
        animal.status = MedivetStatusEnum.ACTIVE;
        await this.animalsRepository.save(animal);
        return animal;
    }

}