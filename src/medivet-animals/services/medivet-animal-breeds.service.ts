import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetCreateAnimalBreedDto } from "@/medivet-animals/dto/medivet-create-animal-bread.dto";
import { MedivetSearchAnimalBreedDto } from "@/medivet-animals/dto/medivet-search-animal-breed.dto";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalBreed } from "@/medivet-animals/entities/medivet-animal-breed.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { paginateData } from "@/medivet-commons/utils";

@Injectable()
export class MedivetAnimalBreedsService {
    constructor(
    @InjectRepository(MedivetAnimalBreed) private animalBreedsRepository: Repository<MedivetAnimalBreed>,
    @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>,
    ) {
    }

    async createAnimalBreed(createBreedDto: MedivetCreateAnimalBreedDto): Promise<MedivetAnimalBreed> {
        if (await this.checkIfAnimalBreedAlreadyExists(createBreedDto)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.ANIMAL_BREED_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        const newBreed = this.animalBreedsRepository.create({
            name: createBreedDto.name,
            type: createBreedDto.type
        });
        await this.animalBreedsRepository.save(newBreed);
        return newBreed;
    };

    async findOneAnimalBreedById(id: number): Promise<MedivetAnimalBreed> {
        const animalBreed = await this.animalBreedsRepository.findOne({ where: { id } });
        if (!animalBreed) {
            throw new NotFoundException({
                message: ErrorMessagesConstants.ANIMAL_BREED_WITH_THIS_ID_DOES_NOT_EXIST,
                property: "all"
            });
        }
        return animalBreed;
    }

    async searchAnimalBreeds(searchAnimalBreedDto: MedivetSearchAnimalBreedDto): Promise<MedivetAnimalBreed[]> {
        let breeds = await this.findAllAnimalBreeds();

        if (searchAnimalBreedDto.animalType) {
            breeds = breeds.filter(breed => breed.type.toLowerCase().includes(searchAnimalBreedDto.animalType.toLowerCase()));
        }

        if (searchAnimalBreedDto.search) {
            const searchToLowerCase = searchAnimalBreedDto.search.toLowerCase();
            breeds = breeds.filter(breed => breed.type.toLowerCase().includes(searchToLowerCase)
        || breed.name.toLowerCase().includes(searchToLowerCase));
        }

        return paginateData(breeds, {
            offset: searchAnimalBreedDto.offset,
            pageSize: searchAnimalBreedDto.pageSize
        });
    }

    async removeAnimalBreed(breedId: number): Promise<void> {
        const breed = await this.findOneAnimalBreedById(breedId);

        if (breed) {
            const breedInUse = await this.checkIfAnimalBreedIsInUse(breedId);
            if (breedInUse) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_ANIMAL_BREED_WHICH_IS_IN_USE,
                        property: "all"
                    }
                ]);
            }
            this.animalBreedsRepository.remove(breed);
        }
    }

    async updateAnimalBreed(breedId: number, updateBreedDto: MedivetCreateAnimalBreedDto): Promise<MedivetAnimalBreed> {
        const breed = await this.findOneAnimalBreedById(breedId);
        const { name, type } = updateBreedDto;

        if (breed) {
            breed.name = name;
            breed.type = type;

            await this.animalBreedsRepository.save(breed);
            return breed;
        }
    }

    private async checkIfAnimalBreedAlreadyExists(createBreedDto: MedivetCreateAnimalBreedDto): Promise<boolean> {
        const { name, type } = createBreedDto;
        const existingBreed = await this.animalBreedsRepository.findOne({
            where: {
                name,
                type
            }
        });

        if (!existingBreed) return false;
        return true;
    }

    private async findAllAnimalBreeds(): Promise<MedivetAnimalBreed[]> {
        const breeds = await this.animalBreedsRepository.find();
        return breeds;
    }

    private async checkIfAnimalBreedIsInUse(breedId: number): Promise<boolean> {
        const animal = this.animalsRepository.findOne({ where: { breed: { id: breedId } } });
        return !!animal;
    }
}
