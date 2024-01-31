import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchAppointmentDiaryDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "animal",
      required: true
  })
  @IsString()
  @IsNotEmpty()
  include: string;

  @ApiProperty({
      required: false,
      example: [ 1, 2 ]
  })
  @IsArray()
  @IsOptional()
  medicalServiceIds?: number[];

  @ApiProperty({
      required: false,
      example: new Date()
  })
  @IsISO8601()
  @IsOptional()
  appointmentDate?: string;
}
