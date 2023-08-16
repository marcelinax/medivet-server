import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchAnimalBreedDto extends OffsetPaginationDto {
    @ApiProperty({
        example: "Dog",
        required: false
    })
    @IsOptional()
    @IsString()
    animalType?: string;

    @ApiProperty({
        example: "Golden Retriver",
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
