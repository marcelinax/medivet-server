import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetVetSpecializationsModule } from "@/medivet-specializations/medivet-vet-specializations.module";
import { MedivetUsersController } from "@/medivet-users/controllers/medivet-users.controller";
import { MedivetUsersMeController } from "@/medivet-users/controllers/medivet-users-me.controller";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserDeleteLog } from "@/medivet-users/entities/medivet-user-delete-log.entity";
import { MedivetAnonymizeUserService } from "@/medivet-users/services/medivet-anonymize-user.service";
import { MedivetUserProfilePhotosService } from "@/medivet-users/services/medivet-user-profile-photos.service";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetUser,
            MedivetUserDeleteLog,
            MedivetVetSpecialization
        ]),
        forwardRef(() => MedivetVetSpecializationsModule),
        forwardRef(() => MedivetSecurityModule),
    ],
    controllers: [ MedivetUsersController, MedivetUsersMeController ],
    providers: [
        MedivetUsersService,
        MedivetAnonymizeUserService,
        MedivetUserProfilePhotosService
    ],
    exports: [
        MedivetUsersService,
        MedivetAnonymizeUserService,
        MedivetUserProfilePhotosService
    ]
})

export class MedivetUsersModule { }
