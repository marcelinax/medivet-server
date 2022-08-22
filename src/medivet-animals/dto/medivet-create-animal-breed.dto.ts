import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class MedivetCreateAnimalBreedDto {
    @ApiProperty({
        required: true,
        example: 'Golden Retriver',
        minLength: 3
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({
        example: false
    })
    @IsOptional()
    @IsBoolean()
    used: boolean;
}