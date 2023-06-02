import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetSearchAnimalDto } from '@/medivet-animals/dto/medivet-search-animal.dto';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalBreedsService } from '@/medivet-animals/services/medivet-animal-breeds.service';
import { MedivetAnimalCoatColorsService } from "@/medivet-animals/services/medivet-animal-coat-colors.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { MedivetStatusEnum } from "@/medivet-commons/enums/medivet-status.enum";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class MedivetAnimalsService {
    constructor(
        @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>,
        private animalBreedsService: MedivetAnimalBreedsService,
        private animalCoatColorsService: MedivetAnimalCoatColorsService,
    ) { }

    async createAnimal(createAnimalDto: MedivetCreateAnimalDto, owner: MedivetUser): Promise<MedivetAnimal> {
        this.validateAnimalBirthDate(createAnimalDto.birthDate);

        const breed = await this.animalBreedsService.findOneAnimalBreedById(createAnimalDto.breedId);
        const coatColor = await this.animalCoatColorsService.findOneAnimalCoatColorById(createAnimalDto.coatColorId);

        const newAnimal = this.animalsRepository.create({
            name: createAnimalDto.name,
            birthDate: createAnimalDto.birthDate,
            breed,
            gender: createAnimalDto.gender,
            type: createAnimalDto.type,
            coatColor,
            owner
        });
        await this.animalsRepository.save(newAnimal);
        const animalToReturn = { ...newAnimal };
        delete animalToReturn.coatColor;

        return animalToReturn;
    }

    private validateAnimalBirthDate(birthDate: Date): void {
        if (birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

    async findOneAnimalById(id: number, include?: string[]): Promise<MedivetAnimal> {
        const animal = await this.animalsRepository.findOne(
            {
                where: { id },
                // relations: ['owner', 'breed', 'coatColor']
                relations: include ?? []
            });
        if (!animal) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST);
        return animal;
    }

    private async findAllAnimalsAssignedToOwner(user: MedivetUser, include?: string[]): Promise<MedivetAnimal[]> {
        const animals = await this.animalsRepository.find(
            {
                where: { owner: { id: user.id } },
                // relations: ['owner', 'breed', 'coatColor']
                relations: include ?? []
            });
        return animals;
    }

    async findOneAnimalAssignedToOwner(animalId: number, user: MedivetUser, include?: string[]): Promise<MedivetAnimal> {
        const animal = await this.animalsRepository.findOne({
            where: { id: animalId, owner: { id: user.id } },
            // relations: ['owner', 'breed', 'coatColor']
            relations: include ?? []
        });
        if (!animal) throw new NotFoundException([ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST]);
        delete animal.owner;

        return animal;
    }

    async serachAllAnimalsAssignedToOwner(user: MedivetUser, searchAnimalDto: MedivetSearchAnimalDto): Promise<MedivetAnimal[]> {
        let animals = await this.findAllAnimalsAssignedToOwner(user, searchAnimalDto?.include);

        if (searchAnimalDto.search) {
            animals = animals.filter(animal => animal.name.toLowerCase().includes(searchAnimalDto.search.toLowerCase()));
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
            });
        }

        const pageSize = searchAnimalDto.pageSize || 10;
        const offset = searchAnimalDto.offset || 0;

        return this.paginateAnimals(offset, pageSize, animals);
    }

    private paginateAnimals(offset: number, pageSize: number, animals: MedivetAnimal[]): MedivetAnimal[] {
        return animals.filter((_, index) => index >= offset && index < offset + pageSize);
    }

    async updateAnimal(animalId: number, user: MedivetUser, updateAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
        const animal = await this.findOneAnimalById(animalId, ['owner', 'breed', 'coatColor']);
        const { birthDate, breedId, coatColorId, gender, name, type } = updateAnimalDto;

        if (!this.checkIfUserIsAnimalOwner(user, animal)) throw new UnauthorizedException();
        this.validateAnimalBirthDate(updateAnimalDto.birthDate);

        const breed = await this.animalBreedsService.findOneAnimalBreedById(breedId);
        const coatColor = await this.animalCoatColorsService.findOneAnimalCoatColorById(coatColorId);

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