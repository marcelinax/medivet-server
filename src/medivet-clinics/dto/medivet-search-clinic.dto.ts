import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";

export class MedivetSearchClinicDto extends OffsetPaginationDto {
  @ApiProperty({
      example: "vets",
      required: false,
  })
  @IsOptional()
  @IsString()
  include?: string;

  @ApiProperty({
      example: "Medvet",
      required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
