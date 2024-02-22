import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetVacationController } from "@/medivet-vacations/controllers/medivet-vacation.controller";
import { MedivetVacation } from "@/medivet-vacations/entities/medivet-vacation.entity";
import { MedivetVacationService } from "@/medivet-vacations/services/medivet-vacation.service";

@Module({
    imports: [
        TypeOrmModule.forFeature(
            [ MedivetVacation, MedivetUser, MedivetAppointment ]
        ),
    ],
    controllers: [ MedivetVacationController ],
    providers: [ MedivetVacationService ],
    exports: []
})

export class MedivetVacationsModule {
}
