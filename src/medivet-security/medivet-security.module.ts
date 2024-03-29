import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { envConfig } from "@/medivet-commons/configurations/env-config";
import MedivetSecurityAuthController from "@/medivet-security/controllers/medivet-security-auth.controller";
import { MedivetAuthToken } from "@/medivet-security/entities/medivet-auth-token.entity";
import { MedivetResetPasswordToken } from "@/medivet-security/entities/medivet-reset-password-token.entity";
import { MedivetSecurityAuthService } from "@/medivet-security/services/medivet-security-auth.service";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { JwtStrategy } from "@/medivet-security/strategies/medivet-jwt.strategy";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

const env = envConfig();

@Module({
    imports: [
        forwardRef(() => MedivetUsersModule),
        TypeOrmModule.forFeature([
            MedivetAuthToken,
            MedivetResetPasswordToken
        ]),
        JwtModule.register({ secret: env.ENCRYPT_KEY, })
    ],
    controllers: [ MedivetSecurityAuthController ],
    providers: [
        MedivetSecurityHashingService,
        MedivetSecurityAuthService,
        JwtStrategy
    ],
    exports: [ MedivetSecurityHashingService, MedivetSecurityAuthService ]
})

export class MedivetSecurityModule {}
