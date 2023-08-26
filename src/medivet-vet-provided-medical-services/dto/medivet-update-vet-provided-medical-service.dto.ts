import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNotEmpty, IsNumber } from "class-validator";

export class MedivetUpdateVetProvidedMedicalServiceDto {
  @ApiProperty({
      required: true,
      example: 50.00
  })
  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
      required: true,
      example: 30,
      description: "Presented as minutes"
  })
  @IsNumber()
  @IsNotEmpty()
  duration: number;
}
