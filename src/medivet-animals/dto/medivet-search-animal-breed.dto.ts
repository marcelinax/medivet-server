import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetAnimalType } from "@/medivet-commons/enums/enums";

export class MedivetSearchAnimalBreedDto extends OffsetPaginationDto {
  @ApiProperty({
      example: MedivetAnimalType.DOG,
      required: false
  })
  @IsOptional()
  @IsEnum(MedivetAnimalType)
  animalType?: MedivetAnimalType;

  @IsNotEmpty()
  @IsEnum(MedivetAnimalType)

  @ApiProperty({
      example: "Golden Retriver",
      required: false
  })
  @IsOptional()
  @IsString()
  search?: string;
}
