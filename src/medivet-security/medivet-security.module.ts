import { envConfig } from "@/medivet-commons/configurations/env-config";
import { MedivetSecurityAuthService } from "@/medivet-security/services/medivet-security-auth.service";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import MedivetSecurityAuthController from "./controllers/medivet-security-auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";

const env = envConfig();

@Module({
    imports: [
        forwardRef(() => MedivetUsersModule),
        JwtModule.register({
            secret: env.ENCRYPT_KEY,
        })
    ],
    controllers: [MedivetSecurityAuthController],
    providers: [MedivetSecurityHashingService, MedivetSecurityAuthService, JwtStrategy],
    exports: [MedivetSecurityHashingService, MedivetSecurityAuthService]
})

export class MedivetSecurityModule {}