import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDefined, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested } from "class-validator";

export class MedivetUpdateUserDto {
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
    phoneNumber?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDefined()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty({default: []})
    @IsArray()
    @IsOptional()
    specializationIds: number[];
}