import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchVetSpecializationDto extends OffsetPaginationDto {
    @ApiProperty({
        example: "choroby",
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
