import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class MedivetSearchAppointmentPurposeDto extends OffsetPaginationDto {
    @ApiProperty({
        example: 1,
        required: true
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    specializationId: number;

    @ApiProperty({
        example: 1,
        required: true
    })
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    clinicId: number;

    @ApiProperty({
        example: "Szczepienie"
    })
    @IsOptional()
    @IsString()
    name: string;
}