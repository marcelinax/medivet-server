import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class MedivetCreatePriceListDto {
    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNotEmpty()
    @IsNumber()
    specializationId: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNotEmpty()
    @IsNumber()
    clinicId: number;
}