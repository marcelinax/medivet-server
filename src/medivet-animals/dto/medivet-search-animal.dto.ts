import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";

export class MedivetSearchAnimalDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "Casper",
      required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
      example: MedivetSortingModeEnum.ASC,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetSortingModeEnum)
  sortingMode: MedivetSortingModeEnum;

  @ApiProperty({
      example: "breed",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;
}
