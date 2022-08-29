import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class MedivetSearchClinicDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'Medvet'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        example: 'Kraków'
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        example: 'Wesoła'
    })
    @IsOptional()
    @IsString()
    street?: string;

    @ApiProperty({
        example: '31-900'
    })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiProperty({
        example: 120
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    buildingNumber?: number;

    @ApiProperty({
        example: 11
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    flatNumber?: number;

    @ApiProperty({
        example: MedivetSortingModeEnum.DESC
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode?: MedivetSortingModeEnum;
}