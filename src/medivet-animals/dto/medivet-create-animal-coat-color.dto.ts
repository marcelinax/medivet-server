import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { MedivetAnimalType } from "../enums/medivet-animal-type.enum";

export class MedivetCreateAnimalCoatColorDto {
    @ApiProperty({
        required: true,
        example: 'Czarny'
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}