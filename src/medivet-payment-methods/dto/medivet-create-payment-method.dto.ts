import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MedivetCreatePaymentMethodDto {
  @ApiProperty({
      example: "Gotówka",
      required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
