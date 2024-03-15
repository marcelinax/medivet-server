import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";

export class MedivetSearchMessageDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetMessageStatus.ARCHIVED,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetMessageStatus)
  status?: MedivetMessageStatus;
}
