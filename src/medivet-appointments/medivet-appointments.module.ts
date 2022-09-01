import { Module } from "@nestjs/common";
import { MedivetAppointmentsService } from '@/medivet-appointments/services/medivet-appointments.service';
import { MedivetAppointmentsController } from '@/medivet-appointments/controllers/medivet-appointments.controller';
import { MedivetAppointmentPurposesService } from '@/medivet-appointments/services/medivet-appointment-purposes.service';
import { MedivetAppointmentPurpose } from '@/medivet-appointments/entities/medivet-appointment-purpose.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetAppointmentPurpose,
            MedivetUser,
            MedivetClinic
        ]),
        MedivetUsersModule
    ],
    providers: [MedivetAppointmentsService, MedivetAppointmentPurposesService],
    controllers: [MedivetAppointmentsController]
})
export class MedivetAppointmentsModule {}