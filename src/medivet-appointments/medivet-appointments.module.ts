import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAnimalsModule } from "@/medivet-animals/medivet-animals.module";
import { MedivetAppointmentsController } from "@/medivet-appointments/controllers/medivet-appointments.controller";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { MedivetVetProvidedMedicalServiceModule } from "@/medivet-vet-provided-medical-services/medivet-vet-provided-medical-service.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetAppointment ]),
        forwardRef(() => MedivetAnimalsModule),
        forwardRef(() => MedivetVetProvidedMedicalServiceModule),
    ],
    providers: [ MedivetAppointmentsService ],
    exports: [ MedivetAppointmentsService ],
    controllers: [ MedivetAppointmentsController ]
})
export class MedivetAppointmentsModule {
}
