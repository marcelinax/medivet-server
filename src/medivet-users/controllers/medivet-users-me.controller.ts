import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { UseInterceptors } from "@nestjs/common";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UpdateMedivetUserPasswordDto } from "@/medivet-users/dto/update-medivet-user-password.dto";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(`${PathConstants.USERS}/${PathConstants.ME}`)
export class MedivetUsersMeController {
    constructor(private usersService: MedivetUsersService) {}

    @ApiOperation({
        summary: 'Get information about authorized user',
        description: 'You can access user information via authorization token'
    })
    @ApiOkResponse({
        description: 'Returns authorized user object',
        type: MedivetUser
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getMe(@CurrentUser() user: MedivetUser): Promise<MedivetUser>{
        return user;
    }

    @ApiOperation({
        summary: `Updates authorized user's password`,
        description: 'The new password and old password are required to update authorized user password'
    })
    @ApiOkResponse({
        description: 'Returns authorized user with updated password',
        type: MedivetUser
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid old password or new password is the same as old password',
        type: BadRequestExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post(PathConstants.UPDATE_PASSWORD) 
    updateMyPassword(@Body() updateUserPasswordDto: UpdateMedivetUserPasswordDto,
        @CurrentUser() user: MedivetUser): Promise<MedivetUser>{
        const { oldPassword, newPassword } = updateUserPasswordDto;
        return this.usersService.updateUserPassword(
            user,
            newPassword,
            oldPassword
        );
    }
 }