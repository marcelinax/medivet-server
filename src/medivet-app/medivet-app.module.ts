import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";

import { MedivetAnimalsModule } from "@/medivet-animals/medivet-animals.module";
import { MedivetAppointmentsModule } from "@/medivet-appointments/medivet-appointments.module";
import { MedivetAvailableDatesModule } from "@/medivet-available-dates/medivet-available-dates.module";
import { MedivetCitiesModule } from "@/medivet-cities/medivet-cities.module";
import { MedivetClinicsModule } from "@/medivet-clinics/medivet-clinics.module";
import { envConfig } from "@/medivet-commons/configurations/env-config";
import { MedivetMailerModule } from "@/medivet-mailer/medivet-mailer.module";
import { MedivetMessagesModule } from "@/medivet-messages/medivet-messages.module";
import { MedivetOpinionsModule } from "@/medivet-opinions/medivet-opinions.module";
import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetVetSpecializationsModule } from "@/medivet-specializations/medivet-vet-specializations.module";
import { MedivetStaticModule } from "@/medivet-static/medivet-static.module";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetVacationsModule } from "@/medivet-vacations/medivet-vacations.module";
import { MedivetVetAvailabilitiesModule } from "@/medivet-vet-availabilities/medivet-vet-availabilities.module";
import { MedivetVetProvidedMedicalServiceModule } from "@/medivet-vet-provided-medical-services/medivet-vet-provided-medical-service.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [ envConfig ]
        }),
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE_NAME,
            entities: [ __dirname + "/../**/*.entity.{js,ts}" ],
            synchronize: true
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "../../..", "storage"),
            serveRoot: "/storage",
        }),
        MedivetUsersModule,
        MedivetSecurityModule,
        MedivetMailerModule,
        MedivetStaticModule,
        MedivetAnimalsModule,
        MedivetClinicsModule,
        MedivetOpinionsModule,
        MedivetVetSpecializationsModule,
        MedivetVetAvailabilitiesModule,
        MedivetVetProvidedMedicalServiceModule,
        MedivetAvailableDatesModule,
        MedivetAppointmentsModule,
        MedivetVacationsModule,
        MedivetCitiesModule,
        MedivetMessagesModule
    ],
})
export class MedivetAppModule {
}
