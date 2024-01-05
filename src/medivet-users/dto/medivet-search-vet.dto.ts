import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetAvailableDatesFilter, MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";

export class MedivetSearchVetDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "Jan Kowalski",
      required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
      example: "1,2",
      required: false
  })
  @IsOptional()
  @IsString()
  specializationIds?: string;

  @ApiProperty({
      example: "1,2",
      required: false
  })
  @IsOptional()
  @IsString()
  medicalServiceIds?: string;

  @ApiProperty({
      example: "Kraków",
      required: false
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
      example: MedivetSortingModeEnum.ASC,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetSortingModeEnum)
  sortingMode?: MedivetSortingModeEnum;

  @ApiProperty({
      example: "Medvet",
      required: false
  })
  @IsOptional()
  @IsString()
  clinicName?: string;

  @ApiProperty({
      example: "animals",
      required: false
  })
  @IsOptional()
  @IsOptional()
  include?: string;

  @ApiProperty({
      example: MedivetAvailableDatesFilter.TODAY,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetAvailableDatesFilter)
  availableDates?: MedivetAvailableDatesFilter;
}
