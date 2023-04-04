import { MedivetAnimalType } from "@/medivet-animals/enums/medivet-animal-type.enum";
import { ValidationMessagesConstants } from '@/medivet-commons/constants/validation-messages.constants';
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class MedivetCreateAnimalDto {
    @ApiProperty({
        required: true,
        example: 'Dingo'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        required: true,
        enum: MedivetAnimalType
    })
    @IsNotEmpty()
    @IsEnum(MedivetAnimalType)
    type: MedivetAnimalType;

    @ApiProperty({
        required: true,
        example: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    @IsNotEmpty()
    birthDate: Date;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    breedId: number;

    @ApiProperty({
        example: 'Jednolite',
        required: false
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    coatColor?: string;

    @ApiProperty({
        required: true,
        enum: MedivetGenderEnum
    })
    @IsEnum(MedivetGenderEnum, {
        message: ValidationMessagesConstants.GENDER_ENUM_VALIDATION
    })
    @IsNotEmpty()
    gender: MedivetGenderEnum;
}