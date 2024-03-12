import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetCitiesController } from "@/medivet-cities/controllers/medivet-cities.controller";
import { MedivetCitiesService } from "@/medivet-cities/services/medivet-cities.service";
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";

@Module({
    imports: [ TypeOrmModule.forFeature([ MedivetClinic ]) ],
    providers: [ MedivetCitiesService ],
    controllers: [ MedivetCitiesController ]
})
export class MedivetCitiesModule {
}
