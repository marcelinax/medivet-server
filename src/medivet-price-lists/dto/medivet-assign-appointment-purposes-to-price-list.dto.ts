import { MedivetGetMyPriceListDto } from "@/medivet-price-lists/dto/medivet-get-my-price-list.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class MedivetAssignAppointmentPurposesToPriceListDto extends MedivetGetMyPriceListDto {
    @ApiProperty({
        example: [1, 2],
        required: true
    })
    @IsArray()
    purposesIds: number[];
}