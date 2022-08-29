import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

export class MedivetSearchAnimalDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'Casper'
    })
    @IsOptional()
    @IsString()
    animalName?: string;

    @ApiProperty({
        example: MedivetSortingModeEnum.ASC
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode: MedivetSortingModeEnum;
}