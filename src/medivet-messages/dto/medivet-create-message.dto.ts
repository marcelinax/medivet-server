import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class MedivetCreateMessageDto {
  @ApiProperty({
      example: "Wiadomość",
      required: true
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
      example: 1,
      required: true
  })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
}
