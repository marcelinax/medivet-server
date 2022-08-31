import { ApiProperty } from "@nestjs/swagger";
import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';
import { MedivetSortingModeEnum } from '@/medivet-commons/enums/medivet-sorting-mode.enum';
import { IsEnum, IsOptional } from "class-validator";

export class MedivetSearchOpinionDto extends OffsetPaginationDto {
    @ApiProperty({
        example: MedivetSortingModeEnum.NEWEST
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode: MedivetSortingModeEnum;
}