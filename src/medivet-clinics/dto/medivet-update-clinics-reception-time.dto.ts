import { ApiProperty } from "@nestjs/swagger";
import { IsMilitaryTime, IsNotEmpty, IsString } from "class-validator";

export class MedivetUpdateClinicsReceptionTimeDto {
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
}