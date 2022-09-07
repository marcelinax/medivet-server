import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class MedivetCreateClinicToVetWithSpecializationsDto {
    @ApiProperty({
        required: true,
        example: 1
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    vetId: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    clinicId: number;

    @ApiProperty({
        required: true,
        example: [1, 2]
    })
    @IsArray()
    @ArrayNotEmpty()
    specializationIds: number[];
}