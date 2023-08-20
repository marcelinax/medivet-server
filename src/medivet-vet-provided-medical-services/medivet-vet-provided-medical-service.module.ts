import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetClinicsModule } from "@/medivet-clinics/medivet-clinics.module";
import { MedivetVetSpecializationsModule } from "@/medivet-specializations/medivet-vet-specializations.module";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetVetProvidedMedicalServiceController } from "@/medivet-vet-provided-medical-services/controllers/medivet-vet-provided-medical-service.controller";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetVetProvidedMedicalService, ]),
        forwardRef(() => MedivetUsersModule),
        forwardRef(() => MedivetVetSpecializationsModule),
        forwardRef(() => MedivetClinicsModule),
    ],
    controllers: [ MedivetVetProvidedMedicalServiceController ],
    providers: [ MedivetVetProvidedMedicalServiceService ],
    exports: []
})

export class MedivetVetProvidedMedicalServiceModule {
}
