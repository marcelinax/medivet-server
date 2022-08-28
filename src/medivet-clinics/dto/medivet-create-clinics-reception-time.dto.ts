import { ApiProperty } from "@nestjs/swagger";
import { IsMilitaryTime, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class MedivietCreateClinicsReceptionTimeDto {
    @ApiProperty({
        required: true,
        example: ['09:00']
    })
    @IsNotEmpty()
    @IsMilitaryTime()
    startTime: string;

    @ApiProperty({
        required: true,
        example: ['13:00']
    })
    @IsNotEmpty()
    @IsMilitaryTime()
    endTime: string;

    @ApiProperty({
        required: true,
        example: 'Monday'
    })
    @IsString()
    @IsNotEmpty()
    day: string;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    clinicId: number;

}