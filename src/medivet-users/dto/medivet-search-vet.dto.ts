import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

export class MedivetSearchVetDto extends OffsetPaginationDto {
    @ApiProperty({
        example: "Jan Kowalski",
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        example: "1,2",
        required: false
    })
    @IsOptional()
    @IsString()
    specializationIds?: string;

    @ApiProperty({
        example: "Kraków",
        required: false
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        example: MedivetGenderEnum.FEMALE,
        required: false
    })
    @IsEnum(MedivetGenderEnum)
    @IsOptional()
    gender?: MedivetGenderEnum;

    @ApiProperty({
        example: MedivetSortingModeEnum.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode?: MedivetSortingModeEnum;

    @ApiProperty({
        example: "Medvet",
        required: false
    })
    @IsOptional()
    @IsString()
    clinicName?: string;

    @ApiProperty({
        example: "animals",
        required: false
    })
    @IsOptional()
    @IsArray()
    include?: string[];
}
