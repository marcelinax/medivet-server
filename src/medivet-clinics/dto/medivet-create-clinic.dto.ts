import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from "class-validator";

import { AddressDto } from "@/medivet-commons/dto/address.dto";

export class MedivetCreateClinicDto {
  @ApiProperty({
      example: "Medvet",
      required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
      example: [ 1, 2 ],
      required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  paymentMethodIds: number[];

  @ApiProperty({
      example: "48123789123",
      required: false
  })
  @IsPhoneNumber("PL")
  @IsString()
  phoneNumber: string;
}
