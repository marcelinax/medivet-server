import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min, MinLength } from "class-validator";

export class MedivetCreateOpinionDto {
    @ApiProperty({
        example: 'Jak najbardziej polecam!',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    message: string;

    @ApiProperty({
        example: 5,
        required: true
    })
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rate: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    vetId: number;
}