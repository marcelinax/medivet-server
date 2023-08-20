import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class MedivetCreateVetSpecializationMedicalServiceDto {
  @ApiProperty({
      required: true,
      example: "Usg brzucha"
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
      required: true,
      example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  specializationId: number;
}
