import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetVetSpecializationController } from "@/medivet-specializations/controllers/medivet-vet-specialization.controller";
import { MedivetVetSpecializationMedicalServiceController } from "@/medivet-specializations/controllers/medivet-vet-specialization-medical-service.controller";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecializationService } from "@/medivet-specializations/services/medivet-vet-specialization.service";
import { MedivetVetSpecializationMedicalServiceService } from "@/medivet-specializations/services/medivet-vet-specialization-medical-service.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetVetSpecialization,
            MedivetVetSpecializationMedicalService,
            MedivetUser
        ]),
        forwardRef(() => MedivetUsersModule),
    ],
    controllers: [ MedivetVetSpecializationMedicalServiceController, MedivetVetSpecializationController ],
    providers: [ MedivetVetSpecializationMedicalServiceService, MedivetVetSpecializationService ],
    exports: [ MedivetVetSpecializationService, MedivetVetSpecializationMedicalServiceService ]
})

export class MedivetVetSpecializationsModule {
}
