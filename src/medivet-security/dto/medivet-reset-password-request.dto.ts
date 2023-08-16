import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class MedivetResetPasswordRequestDto {
    @ApiProperty({
        required: true,
        example: "email@email.com"
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
