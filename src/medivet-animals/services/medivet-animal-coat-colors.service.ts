import { MedivetCreateAnimalCoatColorDto } from "@/medivet-animals/dto/medivet-create-animal-coat-color.dto";
import { MedivetAnimalCoatColor } from '@/medivet-animals/entities/medivet-animal-coat-color.entity';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MedivetSearchAnimalCoatColorDto } from '@/medivet-animals/dto/medivet-search-animal-coat-color.dto';
import { MedivetAnimal } from '@/medivet-animals/entities/medivet-animal.entity';

@Injectable()
export class MedivetAnimalCoatColorsService {
    constructor(
        @InjectRepository(MedivetAnimalCoatColor) private animalCoatColorsRepository: Repository<MedivetAnimalCoatColor>,
        @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>,
    ) { }

    async createAnimalCoatColor(createCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<MedivetAnimalCoatColor> {
        if (await this.checkIfAnimalCoatColorAlreadyExists(createCoatColorDto))
            throw new BadRequestException([ErrorMessagesConstants.ANIMAL_COAT_COLOR_ALREADY_EXISTS]);

        const newCoatColor = this.animalCoatColorsRepository.create({
            name: createCoatColorDto.name,
        });
        await this.animalCoatColorsRepository.save(newCoatColor);
        return newCoatColor;
    };

    private async checkIfAnimalCoatColorAlreadyExists(createCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<boolean> {
        const { name } = createCoatColorDto;
        const existingCoatColor = await this.animalCoatColorsRepository.findOne({
            where: { name }
        });

        if (!existingCoatColor) return false;
        return true;
    }

    async findOneAnimalCoatColorById(id: number): Promise<MedivetAnimalCoatColor> {
        const coatColor = await this.animalCoatColorsRepository.findOne({ where: { id } });
        if (!coatColor) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_COAT_COLOR_WITH_THIS_ID_DOES_NOT_EXIST);
        return coatColor;
    }

    private async findAllAnimalCoatColors(): Promise<MedivetAnimalCoatColor[]> {
        const coatColors = await this.animalCoatColorsRepository.find();
        return coatColors;
    }

    async searchAnimalCoatColors(searchAnimalCoatColorDto: MedivetSearchAnimalCoatColorDto): Promise<MedivetAnimalCoatColor[]> {
        let coatColors = await this.findAllAnimalCoatColors();

        if (searchAnimalCoatColorDto.coatColorName) {
            coatColors = coatColors.filter(color => color.name.toLowerCase().includes(searchAnimalCoatColorDto.coatColorName.toLowerCase()));
        };

        if (searchAnimalCoatColorDto.search) {
            coatColors = coatColors.filter(color => color.name.toLowerCase().includes(searchAnimalCoatColorDto.coatColorName.toLowerCase()));
        }

        const pageSize = searchAnimalCoatColorDto.pageSize || 10;
        const offset = searchAnimalCoatColorDto.offset || 0;
        return this.paginateAnimalCoatColors(offset, pageSize, coatColors);
    }

    private paginateAnimalCoatColors(offset: number, pageSize: number, coatColors: MedivetAnimalCoatColor[]): MedivetAnimalCoatColor[] {
        return coatColors.filter((_, index) => index >= offset && index < offset + pageSize);
    }

    async removeAnimalCoatColor(coatColorId: number): Promise<void> {
        const coatColor = await this.findOneAnimalCoatColorById(coatColorId);

        if (coatColor) {
            const coatColorInUse = await this.checkIfAnimalCoatColorIsInUse(coatColorId);
            if (coatColorInUse)
                throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_ANIMAL_COAT_COLOR_WHICH_IS_IN_USE]);
            this.animalCoatColorsRepository.remove(coatColor);
        }
    }

    private async checkIfAnimalCoatColorIsInUse(coatColorId: number): Promise<boolean> {
        const animal = this.animalsRepository.findOne({ where: { coatColor: { id: coatColorId } } });
        return !!animal;
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
}
