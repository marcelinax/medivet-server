import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class MedivetResetPasswordByTokenDto {
    @ApiProperty({
        required: true,
        example: "abKciOiJIUzI1NiIsJnR5cCI6IkpeyJfdWQiOiI2MjE5ZGViYjk0MzRjNGI3YWRmYWU4MTYiLCJ0IjoxNjQ3OTcwNzI1MTU"
    })
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        required: true,
        minLength: 6,
        example: "password"
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
