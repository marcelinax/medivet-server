import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAnimalsModule } from "@/medivet-animals/medivet-animals.module";
import { MedivetAppointmentDiariesController } from "@/medivet-appointments/controllers/medivet-appointment-diaries.controller";
import { MedivetAppointmentsController } from "@/medivet-appointments/controllers/medivet-appointments.controller";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAppointmentDiary } from "@/medivet-appointments/entities/medivet-appointment-diary.entity";
import { MedivetAppointmentDiariesService } from "@/medivet-appointments/services/medivet-appointment-diaries.service";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { MedivetVetProvidedMedicalServiceModule } from "@/medivet-vet-provided-medical-services/medivet-vet-provided-medical-service.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetAppointment, MedivetAppointmentDiary ]),
        forwardRef(() => MedivetAnimalsModule),
        forwardRef(() => MedivetVetProvidedMedicalServiceModule),
    ],
    providers: [ MedivetAppointmentsService, MedivetAppointmentDiariesService ],
    exports: [ MedivetAppointmentsService ],
    controllers: [ MedivetAppointmentsController, MedivetAppointmentDiariesController ]
})
export class MedivetAppointmentsModule {
}
