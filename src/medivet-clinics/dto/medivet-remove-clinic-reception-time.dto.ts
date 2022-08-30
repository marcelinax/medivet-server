import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class MedivetRemoveClinicReceptionTimeDto {
    @ApiProperty({
        example: 1,
        required: true
    })
    @IsPositive()
    @IsNumber()
    clinicId: number;
}