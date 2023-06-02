import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MedivetCreateVetSpecializationDto {
    @ApiProperty({
        required: true,
        example: 'Choroby psów i kotów'
    })
    @IsNotEmpty()
    @IsString()
    name: string;
}