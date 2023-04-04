import { MedivetAnimalBreedsController } from '@/medivet-animals/controllers/medivet-animal-breeds.controller';
import { MedivetAnimalsController } from '@/medivet-animals/controllers/medivet-animals.controller';
import { MedivetAnimalBreed } from "@/medivet-animals/entities/medivet-animal-breed.entity";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalBreedsService } from '@/medivet-animals/services/medivet-animal-breeds.service';
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetAnimalsService } from '@/medivet-animals/services/medivet-animals.service';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetAnimal,
            MedivetAnimalBreed
        ]),
    ],
    providers: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalBreedsService],
    exports: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalBreedsService],
    controllers: [MedivetAnimalsController, MedivetAnimalBreedsController]
})
export class MedivetAnimalsModule { }