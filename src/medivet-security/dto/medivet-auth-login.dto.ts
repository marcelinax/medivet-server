import { IsEmail, IsNotEmpty } from "class-validator";

export class MedivetAuthLoginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()    
    password: string;
}