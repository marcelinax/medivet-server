import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MedivetSearchAnimalCoatColorDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'Czarny',
        required: false
    })
    @IsOptional()
    @IsString()
    coatColorName?: string;

    @ApiProperty({
        example: 'czar',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}