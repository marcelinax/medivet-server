import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class Address {
    @ApiProperty({
        required: true,
        example: 'Kraków'
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        required: true,
        example: 'Powstańców Warszawskich'
    })
    @IsString()
    @IsNotEmpty()
    street: string;

    @ApiProperty({
        required: true,
        example: 103
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    buildingNumber: number;

    @ApiProperty({
        example: 3
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    flatNumber: number;

    @ApiProperty({
        required: true,
        example: '31-908'
    })
    @IsNotEmpty()
    @IsString()
    zipCode: string;
}