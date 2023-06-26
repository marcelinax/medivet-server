import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class MedivetSearchVetSpecializationMedicalServiceDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'konsultacja',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        example: 'specializations',
        required: false
    })
    @IsOptional()
    @IsArray()
    include?: string[];
}