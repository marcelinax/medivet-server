import { Module } from "@nestjs/common";
import { MedivetPriceListsService } from '@/medivet-price-lists/services/medivet-price-lists.service';
import { MedivetPriceListsController } from '@/medivet-price-lists/controllers/medivet-price-lists.controller';

@Module({
    providers: [MedivetPriceListsService],
    controllers: [MedivetPriceListsController]
})
export class MedivetPriceListsModule {}