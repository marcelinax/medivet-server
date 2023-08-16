import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MedivetCreateAnimalCoatColorDto {
    @ApiProperty({
        required: true,
        example: "Czarny"
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
