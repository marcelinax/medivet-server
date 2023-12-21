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

import { MedivetCreateAnimalCoatColorDto } from "@/medivet-animals/dto/medivet-create-animal-coat-color.dto";
import { MedivetAnimalCoatColor } from "@/medivet-animals/entities/medivet-animal-coat-color.entity";
import { MedivetAnimalCoatColorsService } from "@/medivet-animals/services/medivet-animal-coat-colors.service";
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

@ApiTags(ApiTagsConstants.ANIMAL_COAT_COLORS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMAL_COAT_COLORS)
export class MedivetAnimalCoatColorsController {
    constructor(
    private animalCoatColorsSerivce: MedivetAnimalCoatColorsService,
    ) {
    }

  @ApiOperation({
      summary: "Create new animal coat color",
      description: "Creates new animal's coat color and returns it"
  })
  @ApiOkResponse({
      description: "Animal coat color has been successfully created",
      type: MedivetAnimalCoatColor
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
    createAnimalCoatColor(@Body() createAnimalCoatColorDto: MedivetCreateAnimalCoatColorDto): Promise<MedivetAnimalCoatColor> {
        return this.animalCoatColorsSerivce.createAnimalCoatColor(createAnimalCoatColorDto);
    }

  @ApiOperation({
      summary: "Gets animal coat colors",
      description: "Finds animal coat colors by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns animal coat color data",
      type: MedivetAnimalCoatColor
  })
  @ApiNotFoundResponse({
      description: "Animal coat color does not exist",
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
  async getAnimalCoatColor(@Param("id") coatColorId: number): Promise<MedivetAnimalCoatColor> {
      return this.animalCoatColorsSerivce.findOneAnimalCoatColorById(coatColorId);
  }

  @ApiOperation({
      summary: "Removes existing animal coat color",
      description: "Removes existing animal coat color only when it is not in use"
  })
  @ApiBadRequestResponse({
      description: "You cannot remove animal coat color which is in use.",
      type: BadRequestExceptionDto
  })
  @ApiOkResponse({
      description: "Animal coat color has been removed successfully",
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
  async removeAnimalCoatColor(
    @Param("id") coatColorId: number
  )
    : Promise<OkMessageDto> {
      await this.animalCoatColorsSerivce.removeAnimalCoatColor(coatColorId);
      return { message: SuccessMessageConstants.ANIMAL_COAT_COLOR_HAS_BEN_REMOVED_SUCCESSFULLY };
  }

  @ApiOperation({
      summary: "Updates existing animal coat color",
      description: "Updates existing animal coat color by id and returns it"
  })
  @ApiOkResponse({
      description: "Animal coat color has been updated successfully",
      type: MedivetAnimalCoatColor
  })
  @ApiBadRequestResponse({
      description: "Invalid array form",
      type: BadRequestExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Animal coat color id does not exist",
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
  async updateAnimalCoatColor(
    @Param("id") coatColorId: number,
    @Body() updateCoatColorDto: MedivetCreateAnimalCoatColorDto
  ): Promise<MedivetAnimalCoatColor> {
      return await this.animalCoatColorsSerivce.updateAnimalCoatColor(coatColorId, updateCoatColorDto);
  }

  @ApiOperation({
      summary: "Returns searched animal coat colors",
      description: "Enables search animal coat colors by name"
  })
  @ApiOkResponse({
      description: "Returns array of matched animal coat colors",
      type: MedivetAnimalCoatColor,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "coatColorName",
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
  async getAnimalCoatColors(
    @Query("pageSize") pageSize: number, @Query("offset") offset: number,
    @Query("search") search?: string
  ): Promise<MedivetAnimalCoatColor[]> {
      return this.animalCoatColorsSerivce.searchAnimalCoatColors({
          search,
          pageSize,
          offset,
      });
  };
}
