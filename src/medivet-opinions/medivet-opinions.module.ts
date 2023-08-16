import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetOpinionsController } from "@/medivet-opinions/controllers/medivet-opinions.controller";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetOpinionsService } from "@/medivet-opinions/services/medivet-opinions.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetOpinion,
            MedivetUser
        ]),
        forwardRef(() => MedivetUsersModule)
    ],
    providers: [ MedivetOpinionsService ],
    controllers: [ MedivetOpinionsController ]
})
export class MedivetOpinionsModule {}
