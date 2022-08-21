import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { MedivetAnimalType } from "@/medivet-animals/enums/medivet-animal-type.enum";
import { Transform } from "class-transformer";
import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import { ValidationMessagesConstants } from '@/medivet-commons/constants/validation-messages.constants';

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
    type: MedivetAnimalType

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
        example: 'Golden Retriver'
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    breed: string;

    @ApiProperty({
        required: true,
        enum: MedivetGender
    })
    @IsEnum(MedivetGender, {
        message: ValidationMessagesConstants.GENDER_ENUM_VALIDATION
    })
    @IsNotEmpty()
    gender: MedivetGender;
}