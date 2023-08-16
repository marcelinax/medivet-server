import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchAnimalCoatColorDto extends OffsetPaginationDto {
    @ApiProperty({
        example: "Czarny",
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
