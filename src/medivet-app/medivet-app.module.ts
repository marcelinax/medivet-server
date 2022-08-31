import { MedivetAnimalsModule } from '@/medivet-animals/medivet-animals.module';
import { MedivetClinicsModule } from '@/medivet-clinics/medivet-clinics.module';
import { envConfig } from '@/medivet-commons/configurations/env-config';
import { MedivetMailerModule } from '@/medivet-mailer/medivet-mailer.module';
import { MedivetOpinionsModule } from '@/medivet-opinions/medivet-opinions.module';
import { MedivetSecurityModule } from '@/medivet-security/medivet-security.module';
import { MedivetStaticModule } from '@/medivet-static/medivet-static.module';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig]
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      entities: ["dist/**/*.entity{.ts,.js}"],
      synchronize: true
    }),
    MedivetUsersModule,
    MedivetSecurityModule,
    MedivetMailerModule,
    MedivetStaticModule,
    MedivetAnimalsModule,
    MedivetClinicsModule,
    MedivetOpinionsModule
  ],
})
export class MedivetAppModule {}
