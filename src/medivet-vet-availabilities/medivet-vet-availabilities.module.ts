import { forwardRef,Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicsModule } from "@/medivet-clinics/medivet-clinics.module";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetVetSpecializationsModule } from "@/medivet-specializations/medivet-vet-specializations.module";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetVetAvailabilitiesController } from "@/medivet-vet-availabilities/controllers/medivet-vet-availabilities.controller";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetAvailabilityReceptionHour } from "@/medivet-vet-availabilities/entities/medivet-vet-availability-reception-hour.entity";
import { MedivetVetAvailabilitiesService } from "@/medivet-vet-availabilities/services/medivet-vet-availabilities.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetVetAvailability,
            MedivetClinic,
            MedivetUser,
            MedivetVetAvailabilityReceptionHour,
            MedivetVetSpecialization
        ]),
        forwardRef(() => MedivetUsersModule),
        forwardRef(() => MedivetClinicsModule),
        forwardRef(() => MedivetVetSpecializationsModule),
    ],
    providers: [ MedivetVetAvailabilitiesService ],
    controllers: [ MedivetVetAvailabilitiesController ]
})
export class MedivetVetAvailabilitiesModule { }
