import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAvailableDatesModule } from "@/medivet-available-dates/medivet-available-dates.module";
import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecializationsModule } from "@/medivet-specializations/medivet-vet-specializations.module";
import { MedivetFavouriteVetUsersController } from "@/medivet-users/controllers/medivet-favourite-vet-users.controller";
import { MedivetUsersController } from "@/medivet-users/controllers/medivet-users.controller";
import { MedivetUsersMeController } from "@/medivet-users/controllers/medivet-users-me.controller";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserDeleteLog } from "@/medivet-users/entities/medivet-user-delete-log.entity";
import { MedivetUserFavouriteVet } from "@/medivet-users/entities/medivet-user-favourite-vet.entity";
import { MedivetAnonymizeUserService } from "@/medivet-users/services/medivet-anonymize-user.service";
import { MedivetFavouriteVetUsersService } from "@/medivet-users/services/medivet-favourite-vet-users.service";
import { MedivetUserProfilePhotosService } from "@/medivet-users/services/medivet-user-profile-photos.service";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetUser,
            MedivetUserDeleteLog,
            MedivetVetSpecialization,
            MedivetVetSpecializationMedicalService,
            MedivetVetProvidedMedicalService,
            MedivetUserFavouriteVet
        ]),
        forwardRef(() => MedivetVetSpecializationsModule),
        forwardRef(() => MedivetSecurityModule),
        forwardRef(() => MedivetAvailableDatesModule),
    ],
    controllers: [ MedivetUsersController, MedivetUsersMeController, MedivetFavouriteVetUsersController ],
    providers: [
        MedivetUsersService,
        MedivetAnonymizeUserService,
        MedivetUserProfilePhotosService,
        MedivetFavouriteVetUsersService
    ],
    exports: [
        MedivetUsersService,
        MedivetAnonymizeUserService,
        MedivetUserProfilePhotosService
    ]
})

export class MedivetUsersModule {
}
