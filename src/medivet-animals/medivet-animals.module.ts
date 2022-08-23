import { Module } from "@nestjs/common";
import { MedivetAnimalsService } from '@/medivet-animals/services/medivet-animals.service';
import { MedivetAnimalsController } from '@/medivet-animals/controllers/medivet-animals.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";

@Module({
    imports: [
    TypeOrmModule.forFeature([
            MedivetAnimal
        ]),
    ],
    providers: [MedivetAnimalsService, MedivetAnimalProfilePhotosService],
    exports: [MedivetAnimalsService, MedivetAnimalProfilePhotosService ],
    controllers: [MedivetAnimalsController]
})
export class MedivetAnimalsModule {}