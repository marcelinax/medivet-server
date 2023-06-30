import { MedivetClinicAssignmentRequestsController } from '@/medivet-clinics/controllers/medivet-clinic-assignment-requests.controller';
import { MedivetClinicsController } from '@/medivet-clinics/controllers/medivet-clinics.controller';
import { MedivetClinicAssignmentRequest } from '@/medivet-clinics/entities/medivet-clinic-assignment-request.entity';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetClinicAssignmentRequestService } from '@/medivet-clinics/services/medivet-clinic-assignment-requests.service';
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { MedivetVetSpecialization } from '@/medivet-specializations/entities/medivet-vet-specialization.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';


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
    controllers: [MedivetClinicsController, MedivetClinicAssignmentRequestsController]
})
export class MedivetClinicsModule { }