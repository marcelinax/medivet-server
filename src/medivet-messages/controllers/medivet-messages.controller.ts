import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";
import { MedivetUserConversation } from "@/medivet-messages/types/types";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.MESSAGES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.MESSAGES)
export class MedivetMessagesController {
    constructor(
    private messagesService: MedivetMessagesService
    ) {
    }

  @ApiOperation({
      summary: "Gets all user conversations filtered by status from",
      description: "Returns all sent and received user's conversations filtered by status from newest to oldest"
  })
  @ApiOkResponse({
      description: "Returns array of all user conversations filtered by status",
      type: MedivetMessage,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "status",
      required: false,
      enum: MedivetMessageStatus
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT, MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get()
    async searchUserConversations(
    @CurrentUser() user: MedivetUser,
    @Query("status") status?: MedivetMessageStatus,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    ): Promise<MedivetUserConversation[]> {
        return this.messagesService.searchAllUserConversations(user, {
            offset,
            pageSize,
            status
        });
    }
}
