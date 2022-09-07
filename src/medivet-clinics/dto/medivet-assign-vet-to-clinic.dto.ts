import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray } from "class-validator";

export class MedivetAssignVetToClinicDto {
    @ApiProperty({
        required: true,
        example: [1, 2]
    })
    @IsArray()
    @ArrayNotEmpty()
    specializationIds: number[];
}