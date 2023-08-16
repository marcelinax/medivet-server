import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

import { MedivetClinicAssignmentRequestStatus } from "@/medivet-commons/enums/medivet-clinic.enums";

export class MedivetCreateClinicAssignmentRequestDto {
    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        required: true,
        example: 1
    })
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    clinicId: number;

    @ApiProperty({
        required: true,
        enum: MedivetClinicAssignmentRequestStatus,
    })
    @IsNotEmpty()
    @IsEnum(MedivetClinicAssignmentRequestStatus)
    status: MedivetClinicAssignmentRequestStatus;
}
