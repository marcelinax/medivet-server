import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class MedivetAuthLoginDto {
    @ApiProperty({
        required: true,
        example: 'email@email.com'
})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        required: true,
        example: 'password'
    })
    @IsNotEmpty()    
    password: string;
}