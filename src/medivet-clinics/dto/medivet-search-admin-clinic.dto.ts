import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";

export class MedivetSearchAdminClinicDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "Medvet",
      required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
      example: "Kraków",
      required: false
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
      example: "Wesoła",
      required: false
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({
      example: "31-900",
      required: false
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
      example: 120,
      required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  buildingNumber?: number;

  @ApiProperty({
      example: 11,
      required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  flatNumber?: number;

  @ApiProperty({
      example: MedivetSortingModeEnum.DESC,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetSortingModeEnum)
  sortingMode?: MedivetSortingModeEnum;

  @ApiProperty({
      example: "vets",
      required: false
  })
  @IsOptional()
  @IsArray()
  include?: string[];

  @ApiProperty({
      example: "Medvet",
      required: false
  })
  @IsOptional()
  @IsString()
  search?: string;
}
