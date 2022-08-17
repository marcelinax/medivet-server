import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetUsersController } from "@/medivet-users/controllers/medivet-users.controller";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetUsersMeController } from "@/medivet-users/controllers/medivet-users-me.controller";
import { MedivetUserDeleteLog } from "@/medivet-users/entities/medivet-user-delete-log.entity";
import { MedivetAnonymizeUserService } from "@/medivet-users/services/medivet-anonymize-user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetUser,
            MedivetUserDeleteLog
        ]),
        forwardRef(() => MedivetSecurityModule),
    ],
    controllers: [MedivetUsersController, MedivetUsersMeController],
    providers: [MedivetUsersService, MedivetAnonymizeUserService],
    exports: [MedivetUsersService, MedivetAnonymizeUserService]
})

export class MedivetUsersModule {}