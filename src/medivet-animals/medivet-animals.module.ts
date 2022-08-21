import { Module } from "@nestjs/common";
import { MedivetAnimalsService } from '@/medivet-animals/services/medivet-animals.service';
import { MedivetAnimalsController } from '@/medivet-animals/controllers/medivet-animals.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetAnimal,
        ]),
    ],
    providers: [MedivetAnimalsService],
    exports: [MedivetAnimalsService],
    controllers: [MedivetAnimalsController]
})
export class MedivetAnimalsModule {}