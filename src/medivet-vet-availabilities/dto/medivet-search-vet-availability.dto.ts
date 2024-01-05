import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchVetAvailabilityDto extends OffsetPaginationDto {
  @ApiProperty({
      required: false,
      example: 1
  })
  @IsNumber()
  @IsOptional()
  clinicId?: number;

  @ApiProperty({
      required: false,
      example: 1
  })
  @IsNumber()
  @IsOptional()
  vetId?: number;

  @ApiProperty({
      example: "clinic",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;
}
