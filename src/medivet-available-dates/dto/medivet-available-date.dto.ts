import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class MedivetAvailableDateDto {
  @ApiProperty({
      required: true,
      example: new Date()
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;
}
