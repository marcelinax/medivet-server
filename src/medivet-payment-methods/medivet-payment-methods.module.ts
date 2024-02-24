import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MedivetPaymentMethodsController } from "@/medivet-payment-methods/controllers/medivet-payment-methods.controller";
import { MedivetPaymentMethod } from "@/medivet-payment-methods/entities/medivet-payment-method.entity";
import { MedivetPaymentMethodsService } from "@/medivet-payment-methods/services/medivet-payment-methods.service";

@Module({
    imports: [ TypeOrmModule.forFeature([ MedivetPaymentMethod, ]), ],
    providers: [ MedivetPaymentMethodsService ],
    controllers: [ MedivetPaymentMethodsController ]
})
export class MedivetPaymentMethodsModule {
}
