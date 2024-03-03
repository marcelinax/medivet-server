import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum, MedivetVacationStatus } from "@/medivet-commons/enums/enums";

export class MedivetSearchVacationDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetSortingModeEnum.ASC,
      required: false
  })
  @IsEnum(MedivetSortingModeEnum)
  @IsOptional()
  sortingMode?: MedivetSortingModeEnum;

  @ApiProperty({
      example: MedivetVacationStatus.ACTIVE,
      required: false
  })
  @IsEnum(MedivetVacationStatus)
  @IsOptional()
  status?: MedivetVacationStatus;
}
