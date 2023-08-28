import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional } from "class-validator";

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
  @IsArray()
  include?: string[];
}
