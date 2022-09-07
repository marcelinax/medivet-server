import { forwardRef, Module } from "@nestjs/common";
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetClinicsController } from '@/medivet-clinics/controllers/medivet-clinics.controller';
import { MedivetClinicsReceptionTime } from "@/medivet-clinics/entities/medivet-clinics-reception-time.entity";
import { MedivetClinicsReceptionTimesController } from "@/medivet-clinics/controllers/medivet-clinics-reception-times.controller";
import { MedivetClinicsReceptionTimesService } from "@/medivet-clinics/services/medivet-clinics-reception-times.service";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { MedivetClinicToVetWithSpecializationsService } from '@/medivet-clinics/services/medivet-clinic-to-vet-with-specializations.service';
import { MedivetClinicToVetWithSpecializations } from '@/medivet-clinics/entities/medivet-clinic-to-vet-with-specializations.entity';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([
            MedivetClinic,
            MedivetClinicsReceptionTime,
            MedivetUser,
            MedivetClinicToVetWithSpecializations,
            MedivetVetSpecialization
        ]),
        MedivetUsersModule,
    ],
    providers: [
        MedivetClinicsService,
        MedivetClinicsReceptionTimesService,
        MedivetClinicToVetWithSpecializationsService
    ],
    controllers: [MedivetClinicsController, MedivetClinicsReceptionTimesController]
})
export class MedivetClinicsModule {}