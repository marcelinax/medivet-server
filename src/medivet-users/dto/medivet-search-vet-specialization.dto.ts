import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MedivetSearchVetSpecializationDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'choroby',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;
}