import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class MedivetCreateVacationDto {
  @ApiProperty({
      required: true,
      example: new Date()
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
      required: true,
      example: new Date(new Date().setMonth(new Date().getMonth() + 1))
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  to: Date;
}
