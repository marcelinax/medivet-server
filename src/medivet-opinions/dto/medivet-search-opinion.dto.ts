import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";

export class MedivetSearchOpinionDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetSortingModeEnum.NEWEST,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetSortingModeEnum)
  sortingMode?: MedivetSortingModeEnum;

  @ApiProperty({
      example: "appointment",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;
}
