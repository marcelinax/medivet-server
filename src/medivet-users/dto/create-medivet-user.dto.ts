import { ValidationMessagesConstants } from "@/medivet-commons/constants/validation-messages.constants";
import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
export class CreateMedivetUserDto {
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

    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        required: true,
        enum: MedivetGender,
    })
    @IsNotEmpty()
    @IsEnum(MedivetGender, {
        message: ValidationMessagesConstants.GENDER_ENUM_VALIDATION
    })
    gender: MedivetGender;

    @ApiProperty({
        required: true,
        example: new Date()
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
}