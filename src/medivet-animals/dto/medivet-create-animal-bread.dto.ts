import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { MedivetAnimalType } from "../enums/medivet-animal-type.enum";

export class MedivetCreateAnimalBreedDto {
    @ApiProperty({
        required: true,
        example: "Dingo"
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        required: true,
        enum: MedivetAnimalType
    })
    @IsNotEmpty()
    @IsEnum(MedivetAnimalType)
    type: MedivetAnimalType;
}
