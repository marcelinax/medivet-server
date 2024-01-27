import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class MedivetCreateAppointmentDiaryDto {
  @ApiProperty({
      example: 1,
      required: true
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  appointmentId: number;

  @ApiProperty({
      example: "Problemy z chodzeniem",
      required: true
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({
      example: "Oglądnięcie przedniej lewej łapy w celu zdiagnozowania problemu. " +
      "Wymagane było prześwietlenie rendgneowskie.",
      required: true
  })
  @MinLength(50)
  @IsNotEmpty()
  @IsString()
  description: string;
}
