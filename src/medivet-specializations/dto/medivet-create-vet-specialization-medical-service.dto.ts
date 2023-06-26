import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";


export class MedivetCreateVetSpecializationMedicalServiceDto {
    @ApiProperty({
        required: true,
        example: 'Usg brzucha'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        required: true,
        example: [1, 2]
    })
    @IsArray()
    @ArrayNotEmpty()
    specializationIds: number[];
}