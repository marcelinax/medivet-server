import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class MedivetSearchAvailableDatesDto {
  @ApiProperty({
      example: 0,
      required: false,
      description: "month as number value between 0 and 11"
  })
  @Max(11)
  @Min(0)
  @IsOptional()
  @IsPositive()
  @IsNumber()
  month?: number;
}
