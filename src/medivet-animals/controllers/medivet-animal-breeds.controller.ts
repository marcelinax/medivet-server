import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MedivetCreateAnimalBreedDto } from "@/medivet-animals/dto/medivet-create-animal-bread.dto";
import { MedivetAnimalBreed } from "@/medivet-animals/entities/medivet-animal-breed.entity";
import { MedivetAnimalBreedsService } from "@/medivet-animals/services/medivet-animal-breeds.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.ANIMAL_BREEDS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMAL_BREEDS)
export class MedivetAnimalBreedsController {
    constructor(
    private animalBreedsSerivce: MedivetAnimalBreedsService,
    ) {
    }

  @ApiOperation({
      summary: "Create new animal breed",
      description: "Creates new animal's breed depending on animal type and returns it"
  })
  @ApiOkResponse({
      description: "Animal breed has been successfully created",
      type: MedivetAnimalBreed
  })
  @ApiNotFoundResponse({
      description: "Form validation error array",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post()
    createAnimalBreed(@Body() createAnimalBreedDto: MedivetCreateAnimalBreedDto): Promise<MedivetAnimalBreed> {
        return this.animalBreedsSerivce.createAnimalBreed(createAnimalBreedDto);
    }

  @ApiOperation({
      summary: "Gets animal breed",
      description: "Finds animal breed by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns animal breed data",
      type: MedivetAnimalBreed
  })
  @ApiNotFoundResponse({
      description: "Animal breed does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getAnimalBreed(@Param("id") breedId: number): Promise<MedivetAnimalBreed> {
      return this.animalBreedsSerivce.findOneAnimalBreedById(breedId);
  }

  @ApiOperation({
      summary: "Removes existing animal breed",
      description: "Removes existing animal breed only when it is not in use"
  })
  @ApiBadRequestResponse({
      description: "You cannot remove animal breed which is in use.",
      type: BadRequestExceptionDto
  })
  @ApiOkResponse({
      description: "Animal breed has been removed successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  async removeAnimalBreed(
    @Param("id") breedId: number
  )
    : Promise<OkMessageDto> {
      await this.animalBreedsSerivce.removeAnimalBreed(breedId);
      return { message: SuccessMessageConstants.ANIMAL_BREED_HAS_BEN_REMOVED_SUCCESSFULLY };
  }

  @ApiOperation({
      summary: "Updates existing animal breed",
      description: "Updates existing animal breed by id and returns it"
  })
  @ApiOkResponse({
      description: "Animal breed has been updated successfully",
      type: MedivetAnimalBreed
  })
  @ApiBadRequestResponse({
      description: "Invalid array form",
      type: BadRequestExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Animal breed id does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  async updateAnimalBreed(
    @Param("id") breedId: number,
    @Body() updateBreedDto: MedivetCreateAnimalBreedDto
  ): Promise<MedivetAnimalBreed> {
      return await this.animalBreedsSerivce.updateAnimalBreed(breedId, updateBreedDto);
  }

  @ApiOperation({
      summary: "Returns searched animal breeds",
      description: "Enables search animal breeds by name and animal type"
  })
  @ApiOkResponse({
      description: "Returns array of matched animal breeds",
      type: MedivetAnimalBreed,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "animalType",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "search",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAnimalBreeds(
    @Query("pageSize") pageSize: number, @Query("offset") offset: number,
    @Query("search") search?: string, @Query("animalType") animalType?: string
  ): Promise<MedivetAnimalBreed[]> {
      return this.animalBreedsSerivce.searchAnimalBreeds({
          search,
          animalType,
          pageSize,
          offset,
      });
  };
}
