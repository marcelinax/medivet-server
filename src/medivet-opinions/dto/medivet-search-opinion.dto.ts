import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

export class MedivetSearchOpinionDto extends OffsetPaginationDto {
    @ApiProperty({
        example: MedivetSortingModeEnum.NEWEST,
        required: false
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode: MedivetSortingModeEnum;
}
