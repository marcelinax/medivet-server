import { Module } from "@nestjs/common";
import { MedivetOpinionsService } from '@/medivet-opinions/services/medivet-opinions.service';
import { MedivetOpinionsController } from '@/medivet-opinions/controllers/medivet-opinions.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetOpinion } from '@/medivet-opinions/entities/medivet-opinion.entity';
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
    TypeOrmModule.forFeature([
        MedivetOpinion,
        MedivetUser
    ]),
    MedivetUsersModule
    ],
    providers: [MedivetOpinionsService],
    controllers: [MedivetOpinionsController]
})
export class MedivetOpinionsModule {}