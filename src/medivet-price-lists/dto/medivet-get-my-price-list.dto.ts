import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class MedivetGetMyPriceListDto {
    @ApiProperty({
        example: 1,
        required: true
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    specializationId: number;

    @ApiProperty({
        example: 1,
        required: true
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    clinicId: number;
}