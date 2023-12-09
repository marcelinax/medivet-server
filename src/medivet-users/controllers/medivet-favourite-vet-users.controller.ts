import {
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetFavouriteVetUsersService } from "@/medivet-users/services/medivet-favourite-vet-users.service";

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(`${PathConstants.USERS}/${PathConstants.FAVOURITE_VETS}`)
export class MedivetFavouriteVetUsersController {
    constructor(
    private favouriteVetUsersService: MedivetFavouriteVetUsersService
    ) {
    }

  @ApiOperation({ summary: "Adds vet to user favourite vets list", })
  @ApiOkResponse({
      description: "Vet has been added to favourites successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBadRequestResponse({
      description: "Vet was not found",
      type: BadRequestExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(PathConstants.ID_PARAM)
    addVetToFavourites(
    @Param("id") vetId: number,
    @CurrentUser() user: MedivetUser
    ): Promise<OkMessageDto> {
        return this.favouriteVetUsersService.addVetToFavourites(
            user,
            vetId
        );
    }

  @ApiOperation({ summary: "Removes vet from user favourite vets list", })
  @ApiOkResponse({
      description: "Vet has been removed from favourites successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBadRequestResponse({
      description: "Cannot remove vet who is not in user favourite vets list",
      type: BadRequestExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  removeVetFromFavourites(
    @Param("id") vetId: number,
    @CurrentUser() user: MedivetUser
  ): Promise<OkMessageDto> {
      return this.favouriteVetUsersService.removeVetFromFavourites(
          vetId,
          user
      );
  }

  @ApiOperation({ summary: "Checks if vet is in user favourite vets list", })
  @ApiOkResponse({ type: Boolean })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  checkIfVetIsInFavourites(
    @Param("id") vetId: number,
    @CurrentUser() user: MedivetUser
  ): Promise<boolean> {
      return this.favouriteVetUsersService.isVetInUserFavourites(
          vetId,
          user
      );
  }
}
