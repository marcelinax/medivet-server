import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

import { MedivetCreateVetAvailabilityReceptionHourDto } from "./medivet-create-vet-availability-reception-hour.dto";

export class MedivetCreateVetAvailabilityDto {
  @ApiProperty({
      required: true,
      example: 1
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  clinicId: number;

  @ApiProperty({
      required: true,
      example: 1
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
      required: true,
      example: 1
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  specializationId: number;

  @ApiProperty({
      required: true,
      example: [
          {
              day: "MONDAY",
              hourFrom: "09:00",
              hourTo: "13:00",
          }
      ],
      isArray: true
  })
  @IsArray()
  @ArrayNotEmpty()
  receptionHours: MedivetCreateVetAvailabilityReceptionHourDto[];
}
