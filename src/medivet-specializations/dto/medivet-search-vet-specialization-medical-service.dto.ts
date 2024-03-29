import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchVetSpecializationMedicalServiceDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "konsultacja",
      required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
      example: "specialization",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;

  @ApiProperty({
      required: false,
      example: [ 1, 2 ]
  })
  @IsArray()
  @IsOptional()
  specializationIds?: number[];
}
