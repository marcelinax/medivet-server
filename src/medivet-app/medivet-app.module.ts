import { envConfig } from '@/medivet-commons/configurations/env-config';
import { MedivetSecurityModule } from '@/medivet-security/medivet-security.module';
import { MedivetRoleGuard } from '@/medivet-storage/guards/medivet-role.guard';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
    MedivetSecurityModule
  ],
})
export class MedivetAppModule {}
