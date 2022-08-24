import { Address } from "@/medivet-commons/dto/address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested } from "class-validator";

export class UpdateMedivetUserDto {
    @ApiProperty({
        required: true,
        example: 'Jan Kowalski'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        default: '',
        example: '48123789123'
    })
    @IsOptional()
    @IsPhoneNumber()
    @IsString()
    phoneNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDefined()
    @ValidateNested()
    @Type(() => Address)
    address: Address;
}