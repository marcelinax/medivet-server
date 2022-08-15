import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class UpdateMedivetUserDto {
    @ApiProperty({
        required: true,
        example: 'Jan Kowalski'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        default: '',
        example: '48123789123'
    })
    @IsPhoneNumber()
    @IsString()
    phoneNumber: string;
}