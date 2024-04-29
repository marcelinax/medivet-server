import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";

export class MedivetSearchConversationDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetMessageStatus.ARCHIVED,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetMessageStatus)
  status?: MedivetMessageStatus;

  @ApiProperty({
      example: new Date(),
      required: false
  })
  @IsISO8601()
  @IsOptional()
  lastUpdate?: string;
}
