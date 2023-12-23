import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetAppointmentStatus } from "@/medivet-commons/enums/enums";

export class MedivetSearchAppointmentDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetAppointmentStatus.IN_PROGRESS,
      required: false
  })
  @IsEnum(MedivetAppointmentStatus)
  @IsOptional()
  status?: MedivetAppointmentStatus;

  @ApiProperty({
      example: "animal",
      required: false
  })
  @IsArray()
  @IsOptional()
  include?: string[];
}
