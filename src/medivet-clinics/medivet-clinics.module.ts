import { forwardRef,Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAdminClinicsController } from "@/medivet-clinics/controllers/medivet-admin-clinics.controller";
import { MedivetClinicAssignmentRequestsController } from "@/medivet-clinics/controllers/medivet-clinic-assignment-requests.controller";
import { MedivetClinicsController } from "@/medivet-clinics/controllers/medivet-clinics.controller";
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicAssignmentRequest } from "@/medivet-clinics/entities/medivet-clinic-assignment-request.entity";
import { MedivetClinicAssignmentRequestService } from "@/medivet-clinics/services/medivet-clinic-assignment-requests.service";
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetClinic,
            MedivetUser,
            MedivetVetSpecialization,
            MedivetClinicAssignmentRequest
        ]),
        forwardRef(() => MedivetUsersModule)
    ],
    providers: [
        MedivetClinicsService,
        MedivetClinicAssignmentRequestService
    ],
    exports: [ MedivetClinicsService ],
    controllers: [
        MedivetClinicsController,
        MedivetClinicAssignmentRequestsController,
        MedivetAdminClinicsController
    ]
})
export class MedivetClinicsModule { }
