import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetMessagesController } from "@/medivet-messages/controllers/medivet-messages.controller";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";
import { MedivetMessagesGateway } from "@/medivet-messages/services/medivet-messages-gateway";
import { MedivetSecurityModule } from "@/medivet-security/medivet-security.module";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetMessage, ]),
        forwardRef(() => MedivetUsersModule),
        forwardRef(() => MedivetSecurityModule)
    ],
    providers: [ MedivetMessagesService, MedivetMessagesGateway ],
    controllers: [ MedivetMessagesController ]
})
export class MedivetMessagesModule {
}
