import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNotEmpty, IsNumber } from "class-validator";

export class MedivetCreateVetProvidedMedicalServiceDto {
  @ApiProperty({
      required: true,
      example: 50.00
  })
  @IsNotEmpty()
  @IsDecimal()
  price: number;

  @ApiProperty({
      required: true,
      example: 30,
      description: "Presented as minutes"
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
      required: true,
      example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  specializationMedicalServiceId: number;

  @ApiProperty({
      required: true,
      example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  clinicId: number;
}
