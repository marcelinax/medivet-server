import { MedivetAppointmentsController } from '@/medivet-appointments/controllers/medivet-appointments.controller';
import { MedivetAppointmentsService } from '@/medivet-appointments/services/medivet-appointments.service';
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetVetSpecializationsModule } from '@/medivet-specializations/medivet-vet-specializations.module';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetUser,
            MedivetClinic
        ]),
        MedivetUsersModule,
        MedivetVetSpecializationsModule
    ],
    providers: [MedivetAppointmentsService],
    controllers: [MedivetAppointmentsController],
    exports: []
})
export class MedivetAppointmentsModule { }