import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class MedivetCreateAppointmentPurposeDto {
    @ApiProperty({
        required: true,
        example: 'Szczepienie'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        required: true,
        example: 30
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    specializationId: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    clinicId: number;
}