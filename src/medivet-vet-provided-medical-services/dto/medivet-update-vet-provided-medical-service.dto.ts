import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class MedivetUpdateVetProvidedMedicalServiceDto {
  @ApiProperty({
      required: true,
      example: 50.00
  })
  @IsPositive()
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
