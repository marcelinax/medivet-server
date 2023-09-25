import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class MedivetCreateAppointmentDto {
  @ApiProperty({
      example: 1,
      required: true
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  animalId: number;

  @ApiProperty({
      example: 2,
      required: true
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  medicalServiceId: number;

  @ApiProperty({
      required: true,
      example: new Date()
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;
}
