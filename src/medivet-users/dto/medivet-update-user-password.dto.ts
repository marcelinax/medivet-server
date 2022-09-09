import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class MedivetUpdateUserPasswordDto {
    @ApiProperty({
        required: true,
        example: 'password1'
    })
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @ApiProperty({
        required: true,
        example: 'newpassword'
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}