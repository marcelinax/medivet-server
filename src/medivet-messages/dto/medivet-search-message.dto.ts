import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchMessageDto extends OffsetPaginationDto {
  @ApiProperty({
      example: new Date(),
      required: false
  })
  @IsISO8601()
  @IsOptional()
  lastUpdate?: string;
}
