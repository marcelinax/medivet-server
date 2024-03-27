import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetUpdateMessageDto } from "@/medivet-messages/dto/medivet-update-message.dto";
import { MedivetUserConversationDto } from "@/medivet-messages/dto/medivet-user-conversation.dto";
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
      type: MedivetUserConversationDto,
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

  @ApiOperation({
      summary: "Gets conversation with specified user",
      description: "Returns all messages with specified user from newest to oldest"
  })
  @ApiOkResponse({
      description: "Returns all messages with specified user",
      type: MedivetUserConversationDto,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
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
  @Get(PathConstants.ID_PARAM)
  async getConversationWithUser(
    @Param("id") correspondingUserId: number,
    @CurrentUser() user: MedivetUser,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
  ): Promise<MedivetMessage[]> {
      return this.messagesService.getMessagesWithUser(user, correspondingUserId, {
          pageSize,
          offset
      });
  }

  @ApiOperation({ summary: "Changes status for all messages with specified user", })
  @ApiOkResponse({
      description: SuccessMessageConstants.USER_CONVERSATION_STATUS_HAS_BEEN_CHANGED_SUCCESSFULLY,
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: ErrorMessagesConstants.CANNOT_CHANGE_MESSAGE_STATUS_FROM_ACTIVE_TO_REMOVED
      || ErrorMessagesConstants.CANNOT_CHANGE_MESSAGE_STATUS_FROM_REMOVED,
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT, MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put()
  async changeConversationStatus(
    @CurrentUser() user: MedivetUser,
    @Body() body: MedivetUpdateMessageDto
  ): Promise<OkMessageDto> {
      return this.messagesService.changeConversationStatus(user, {
          status: body.status,
          userId: body.userId
      });
  }
}
