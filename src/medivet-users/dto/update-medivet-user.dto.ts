import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class UpdateMedivetUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    @IsString()
    phoneNumber: string;
}