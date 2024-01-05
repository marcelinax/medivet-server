import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";

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
      required: false,
      example: [ 1, 2 ]
  })
  @IsArray()
  @IsOptional()
  medicalServiceIds?: number[];

  @ApiProperty({
      required: false,
      example: MedivetSortingModeEnum.ASC
  })
  @IsOptional()
  @IsEnum(MedivetSortingModeEnum)
  sorting?: MedivetSortingModeEnum;

  @ApiProperty({
      example: "clinic",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;
}
