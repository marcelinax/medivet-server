import { ClassSerializerInterceptor, Controller, Param, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetOpinionStatus } from "@/medivet-commons/enums/enums";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetAdminOpinionsService } from "@/medivet-opinions/services/medivet-admin-opinions.service";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.OPINIONS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ADMIN + "/" + PathConstants.OPINIONS)
export class MedivetAdminOpinionsController {
    constructor(
    private adminOpinionsService: MedivetAdminOpinionsService
    ) {
    }

  @ApiOperation({
      summary: "Confirms that added vet opinion is abused",
      description: "Changes added vet opinion status to \"REMOVED\""
  })
  @ApiOkResponse({
      description: "Opinion has been removed successfully",
      type: OkMessageDto
  })
  @ApiNotFoundResponse({
      description: "Opinion with this id does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.CONFIRM_REPORTING + PathConstants.ID_PARAM)
    async confirmReportedOpinion(
    @Param("id") opinionId: number,
    @Query("include") include?: string
    ): Promise<MedivetOpinion> {
        return this.adminOpinionsService.changeOpinionStatus(opinionId, MedivetOpinionStatus.REMOVED, include);
    }

  @ApiOperation({
      summary: "Rejects that added vet opinion is abused",
      description: "Changes added vet opinion status to \"ACTIVE\""
  })
  @ApiOkResponse({
      description: "Opinion has been activated successfully",
      type: OkMessageDto
  })
  @ApiNotFoundResponse({
      description: "Opinion with this id does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.REJECT_REPORTING + PathConstants.ID_PARAM)
  async rejectReportedOpinion(
    @Param("id") opinionId: number,
    @Query("include") include?: string
  ): Promise<MedivetOpinion> {
      return this.adminOpinionsService.changeOpinionStatus(opinionId, MedivetOpinionStatus.ACTIVE, include);
  }
}
