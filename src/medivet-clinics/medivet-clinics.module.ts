import { MedivetClinicsController } from '@/medivet-clinics/controllers/medivet-clinics.controller';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { MedivetVetSpecialization } from '@/medivet-specializations/entities/medivet-vet-specialization.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetClinic,
            MedivetUser,
            MedivetVetSpecialization
        ]),
        MedivetUsersModule,
    ],
    providers: [
        MedivetClinicsService,
    ],
    controllers: [MedivetClinicsController]
})
export class MedivetClinicsModule { }