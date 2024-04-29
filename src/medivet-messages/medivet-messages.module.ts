import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetMessagesController } from "@/medivet-messages/controllers/medivet-messages.controller";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ MedivetMessage, ]),
        forwardRef(() => MedivetUsersModule),
    ],
    providers: [ MedivetMessagesService ],
    controllers: [ MedivetMessagesController ]
})
export class MedivetMessagesModule {
}
