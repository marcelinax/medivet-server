import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray } from "class-validator";

export class MedivetUpdateMyVetSpecializationsDto {
    @ApiProperty({
        example: [ 1, 2 ],
        required: true
    })
    @IsArray()
    @ArrayNotEmpty()
    specializationIds: number[];
}
