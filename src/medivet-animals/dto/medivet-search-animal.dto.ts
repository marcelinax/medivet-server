import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

export class MedivetSearchAnimalDto extends OffsetPaginationDto {
    @ApiProperty({
        example: "Casper",
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        example: MedivetSortingModeEnum.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode: MedivetSortingModeEnum;

    @ApiProperty({
        example: "breed",
        required: false
    })
    @IsOptional()
    @IsArray()
    include?: string[];
}
