import { Module } from "@nestjs/common";
import { MedivetPriceListsService } from '@/medivet-price-lists/services/medivet-price-lists.service';
import { MedivetPriceListsController } from '@/medivet-price-lists/controllers/medivet-price-lists.controller';
import { MedivetAppointmentPurpose } from '@/medivet-appointments/entities/medivet-appointment-purpose.entity';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersModule } from "@/medivet-users/medivet-users.module";
import { MedivetPriceList } from "@/medivet-price-lists/entities/medivet-price-list.entity";

@Module({
    imports: [
    TypeOrmModule.forFeature([
        MedivetUser,
        MedivetAppointmentPurpose,
        MedivetPriceList
    ]),
        MedivetUsersModule
    ],
    providers: [MedivetPriceListsService],
    controllers: [MedivetPriceListsController]
})
export class MedivetPriceListsModule {}