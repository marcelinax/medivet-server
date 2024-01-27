import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchAppointmentDiaryDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "animal",
      required: false
  })
  @IsString()
  @IsNotEmpty()
  include: string;
}
