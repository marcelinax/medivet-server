import { Module } from "@nestjs/common";
import { MedivetPriceListsService } from '@/medivet-price-lists/services/medivet-price-lists.service';
import { MedivetPriceListsController } from '@/medivet-price-lists/controllers/medivet-price-lists.controller';
import { MedivetAppointmentPurpose } from '@/medivet-appointments/entities/medivet-appointment-purpose.entity';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetPriceList } from "@/medivet-price-lists/entities/medivet-price-list.entity";
import { MedivetAppointmentsModule } from "@/medivet-appointments/medivet-appointments.module";

@Module({
    imports: [
    TypeOrmModule.forFeature([
        MedivetUser,
        MedivetAppointmentPurpose,
        MedivetPriceList
    ]),
        MedivetAppointmentsModule
    ],
    providers: [MedivetPriceListsService],
    controllers: [MedivetPriceListsController]
})
export class MedivetPriceListsModule {}