import { Module } from "@nestjs/common";
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetClinicsController } from '@/medivet-clinics/controllers/medivet-clinics.controller';
import { MedivetClinicsReceptionTime } from "@/medivet-clinics/entities/medivet-clinics-reception-time.entity";
import { MedivetClinicsReceptionTimesController } from "@/medivet-clinics/controllers/medivet-clinics-reception-times.controller";
import { MedivetClinicsReceptionTimesService } from "@/medivet-clinics/services/medivet-clinics-reception-times.service";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@Module({
    imports: [
TypeOrmModule.forFeature([
        MedivetClinic,
        MedivetClinicsReceptionTime,
        MedivetUser
    ])
    ],
    providers: [MedivetClinicsService, MedivetClinicsReceptionTimesService],
    controllers: [MedivetClinicsController, MedivetClinicsReceptionTimesController]
})
export class MedivetClinicsModule {}