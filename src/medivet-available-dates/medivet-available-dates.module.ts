import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAvailableDatesController } from "@/medivet-available-dates/controllers/medivet-available-dates.controller";
import { MedivetAvailableDate } from "@/medivet-available-dates/entities/medivet-available-date.entity";
import { MedivetAvailableDatesService } from "@/medivet-available-dates/services/medivet-available-dates.service";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetVacationsModule } from "@/medivet-vacations/medivet-vacations.module";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";
import { MedivetVetProvidedMedicalServiceModule } from "@/medivet-vet-provided-medical-services/medivet-vet-provided-medical-service.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetVetAvailability, MedivetAvailableDate, MedivetVetProvidedMedicalService, MedivetAppointment ]),
        forwardRef(() => MedivetUsersModule),
        forwardRef(() => MedivetVetProvidedMedicalServiceModule),
        forwardRef(() => MedivetVacationsModule),
    ],
    providers: [ MedivetAvailableDatesService ],
    exports: [ MedivetAvailableDatesService ],
    controllers: [ MedivetAvailableDatesController ]
})
export class MedivetAvailableDatesModule {
}
