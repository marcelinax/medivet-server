import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

export class MedivetSearchVetDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'Jan Kowalski'
    })
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({
        example: '1,2'
    })
    @IsOptional()
    @IsString()
    specializationIds: string;

    @ApiProperty({
        example: 'Kraków'
    })
    @IsOptional()
    @IsString()
    city: string;

    @ApiProperty({
        example: MedivetGenderEnum.FEMALE
    })
    @IsEnum(MedivetGenderEnum)
    @IsOptional()
    gender: MedivetGenderEnum;

    @ApiProperty({
        example: MedivetSortingModeEnum.ASC
    })
    @IsOptional()
    @IsEnum(MedivetSortingModeEnum)
    sortingMode: MedivetSortingModeEnum;

    @ApiProperty({
        example: 'Medvet'
    })
    @IsOptional()
    @IsString()
    clinicName: string;
}