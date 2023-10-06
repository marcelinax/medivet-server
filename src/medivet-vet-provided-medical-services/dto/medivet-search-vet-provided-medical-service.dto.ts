import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchVetProvidedMedicalServiceDto extends OffsetPaginationDto {
  @ApiProperty({
      required: true,
      example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  vetId: number;

  @ApiProperty({
      required: false,
      example: [ 1, 2 ]
  })
  @IsArray()
  @IsOptional()
  specializationIds?: number[];

  @ApiProperty({
      example: "clinic",
      required: false
  })
  @IsOptional()
  @IsArray()
  include?: string[];
}
