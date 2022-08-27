import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {  IsDefined, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class MedivetCreateClinicDto {
    @ApiProperty({
        example: 'Medvet',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        required: true
    })
    @IsNotEmpty()
    @IsDefined()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}