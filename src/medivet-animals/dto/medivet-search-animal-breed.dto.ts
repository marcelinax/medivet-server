import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MedivetSearchAnimalBreedDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 'Golden Retriver',
        required: false
    })
    @IsOptional()
    @IsString()
    breedName?: string;

    @ApiProperty({
        example: 'Dog',
        required: false
    })
    @IsOptional()
    @IsString()
    animalType?: string;

    @ApiProperty({
        example: 'golden',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}