import { MedivetAnimalBreedsController } from '@/medivet-animals/controllers/medivet-animal-breeds.controller';
import { MedivetAnimalCoatColorsController } from '@/medivet-animals/controllers/medivet-animal-coat-colors.controller';
import { MedivetAnimalsController } from '@/medivet-animals/controllers/medivet-animals.controller';
import { MedivetAnimalBreed } from "@/medivet-animals/entities/medivet-animal-breed.entity";
import { MedivetAnimalCoatColor } from '@/medivet-animals/entities/medivet-animal-coat-color.entity';
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalBreedsService } from '@/medivet-animals/services/medivet-animal-breeds.service';
import { MedivetAnimalCoatColorsService } from '@/medivet-animals/services/medivet-animal-coat-colors.service';
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetAnimalsService } from '@/medivet-animals/services/medivet-animals.service';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetAnimal,
            MedivetAnimalBreed,
            MedivetAnimalCoatColor
        ]),
    ],
    providers: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalBreedsService, MedivetAnimalCoatColorsService],
    exports: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalBreedsService, MedivetAnimalCoatColorsService],
    controllers: [MedivetAnimalsController, MedivetAnimalBreedsController, MedivetAnimalCoatColorsController]
})
export class MedivetAnimalsModule { }