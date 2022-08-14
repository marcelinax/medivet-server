import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetUsersController } from "@/medivet-users/controllers/medivet-users.controller";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetUser
        ]),
        forwardRef(() => MedivetSecurityModule),
    ],
    controllers: [MedivetUsersController],
    providers: [MedivetUsersService],
    exports: [MedivetUsersService]
})

export class MedivetUsersModule {}