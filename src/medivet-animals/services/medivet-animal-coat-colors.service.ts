import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetCreateAnimalCoatColorDto } from "@/medivet-animals/dto/medivet-create-animal-coat-color.dto";
import { MedivetSearchAnimalCoatColorDto } from "@/medivet-animals/dto/medivet-search-animal-coat-color.dto";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalCoatColor } from "@/medivet-animals/entities/medivet-animal-coat-color.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { paginateData } from "@/medivet-commons/utils";

@Injectable()
export class MedivetAnimalCoatColorsService {
    constructor(
    @InjectRepository(MedivetAnimalCoatColor) private animalCoatColorsRepository: Repository<MedivetAnimalCoatColor>,
    @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>,
    ) {
    }

    async createAnimalCoatColor(createCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<MedivetAnimalCoatColor> {
        if (await this.checkIfAnimalCoatColorAlreadyExists(createCoatColorDto)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.ANIMAL_COAT_COLOR_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        const newCoatColor = this.animalCoatColorsRepository.create({ name: createCoatColorDto.name, });
        await this.animalCoatColorsRepository.save(newCoatColor);
        return newCoatColor;
    };

    async findOneAnimalCoatColorById(id: number): Promise<MedivetAnimalCoatColor> {
        const coatColor = await this.animalCoatColorsRepository.findOne({ where: { id } });
        if (!coatColor) {
            throw new NotFoundException({
                message: ErrorMessagesConstants.ANIMAL_COAT_COLOR_WITH_THIS_ID_DOES_NOT_EXIST,
                property: "all"
            });
        }
        return coatColor;
    }

    async searchAnimalCoatColors(searchAnimalCoatColorDto: MedivetSearchAnimalCoatColorDto): Promise<MedivetAnimalCoatColor[]> {
        let coatColors = await this.findAllAnimalCoatColors();

        if (searchAnimalCoatColorDto.search) {
            coatColors = coatColors.filter(color => color.name.toLowerCase().includes(searchAnimalCoatColorDto.search.toLowerCase()));
        }

        return paginateData(coatColors, {
            offset: searchAnimalCoatColorDto.offset,
            pageSize: searchAnimalCoatColorDto.pageSize
        });
    }

    async removeAnimalCoatColor(coatColorId: number): Promise<void> {
        const coatColor = await this.findOneAnimalCoatColorById(coatColorId);

        if (coatColor) {
            const coatColorInUse = await this.checkIfAnimalCoatColorIsInUse(coatColorId);
            if (coatColorInUse) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_ANIMAL_COAT_COLOR_WHICH_IS_IN_USE,
                        property: "all"
                    }
                ]);
            }
            this.animalCoatColorsRepository.remove(coatColor);
        }
    }

    async updateAnimalCoatColor(coatColorId: number, updateCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<MedivetAnimalCoatColor> {
        const coatColor = await this.findOneAnimalCoatColorById(coatColorId);
        const { name } = updateCoatColorDto;

        if (coatColor) {
            coatColor.name = name;

            await this.animalCoatColorsRepository.save(coatColor);
            return coatColor;
        }
    }

    private async checkIfAnimalCoatColorAlreadyExists(createCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<boolean> {
        const { name } = createCoatColorDto;
        const existingCoatColor = await this.animalCoatColorsRepository.findOne({ where: { name } });

        if (!existingCoatColor) return false;
        return true;
    }

    private async findAllAnimalCoatColors(): Promise<MedivetAnimalCoatColor[]> {
        const coatColors = await this.animalCoatColorsRepository.find();
        return coatColors;
    }

    private async checkIfAnimalCoatColorIsInUse(coatColorId: number): Promise<boolean> {
        const animal = this.animalsRepository.findOne({ where: { coatColor: { id: coatColorId } } });
        return !!animal;
    }
}
