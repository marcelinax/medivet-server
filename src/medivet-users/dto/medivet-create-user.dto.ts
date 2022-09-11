import { ValidationMessagesConstants } from "@/medivet-commons/constants/validation-messages.constants";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class MedivetCreateUserDto {
    @ApiProperty({
        required: true,
        example: 'email@email.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        required: true,
        minLength: 6,
        example: 'password'
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        required: true,
        example: 'Jan Kowalski'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

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
    @Transform(({value}) => new Date(value))
    @IsDate()
    birthDate: Date;

    @ApiProperty({
        required: true,
        enum:MedivetUserRole
    })
    @IsNotEmpty()
    @IsEnum(MedivetUserRole)
    role: MedivetUserRole;

    @ApiProperty({
        example: true,
        required: true
    })
    @IsBoolean()
    acceptTerms: boolean;
}