import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";

export class MedivetUpdateMessageDto {
  @ApiProperty({
      example: MedivetMessageStatus.ARCHIVED,
      required: true
  })
  @IsEnum(MedivetMessageStatus)
  @IsNotEmpty()
  status: MedivetMessageStatus;

  @ApiProperty({
      example: 2,
      required: true
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
