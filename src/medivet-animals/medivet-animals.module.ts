import { Module } from "@nestjs/common";
import { MedivetAnimalsService } from '@/medivet-animals/services/medivet-animals.service';
import { MedivetAnimalsController } from '@/medivet-animals/controllers/medivet-animals.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetAnimalsBreedsService } from "@/medivet-animals/services/medivet-animals-breeds.service";
import { MedivetAnimalBreed } from '@/medivet-animals/entities/medivet-animal-breed.entity';
import { MedivetAnimalsBreedsController } from '@/medivet-animals/controllers/medivet-animals-breeds.controller';

@Module({
    imports: [
TypeOrmModule.forFeature([
            MedivetAnimal,
            MedivetAnimalBreed
        ]),
    ],
    providers: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalsBreedsService],
    exports: [MedivetAnimalsService, MedivetAnimalProfilePhotosService, MedivetAnimalsBreedsService],
    controllers: [MedivetAnimalsController, MedivetAnimalsBreedsController]
})
export class MedivetAnimalsModule {}