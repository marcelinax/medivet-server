import { ValidationMessagesConstants } from "@/medivet-commons/constants/validation-messages.constants";
import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

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
        example: '48123789123',
        required: false
    })
    @IsOptional()
    @IsPhoneNumber('PL')
    @IsString()
    phoneNumber?: string;

    @ApiProperty({
        required: true
    })
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty({
        required: true,
        enum: MedivetGenderEnum,
    })
    @IsNotEmpty()
    @IsEnum(MedivetGenderEnum, {
        message: ValidationMessagesConstants.GENDER_ENUM_VALIDATION
    })
    gender: MedivetGenderEnum;

    @ApiProperty({
        required: true,
        example: new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    birthDate: Date;

    @ApiProperty({
        default: [],
        required: false
    })
    @IsArray()
    @IsOptional()
    specializationIds?: number[];
}