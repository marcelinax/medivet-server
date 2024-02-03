import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetOpinionSortingModeEnum } from "@/medivet-commons/enums/enums";

export class MedivetSearchOpinionDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetOpinionSortingModeEnum.NEWEST,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetOpinionSortingModeEnum)
  sortingMode?: MedivetOpinionSortingModeEnum;

  @ApiProperty({
      example: "appointment",
      required: false
  })
  @IsOptional()
  @IsString()
  include?: string;
}
