import { ValidationMessagesConstants } from "@/medivet-commons/constants/validation-messages.constants";
import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
export class CreateMedivetUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(MedivetGender, {
        message: ValidationMessagesConstants.GENDER_ENUM_VALIDATION
    })
    gender: MedivetGender;

    @IsNotEmpty()
    @Transform(({value}) => new Date(value))
    @IsDate()
    birthDate: Date;

    @IsNotEmpty()
    @IsEnum(MedivetUserRole)
    role: MedivetUserRole;
}