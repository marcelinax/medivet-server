import { Body, ClassSerializerInterceptor, Controller, Get, Post, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedivetSecurityAuthService } from "@/medivet-security/services/medivet-security-auth.service";
import { MedivetAuthLoginDto } from '@/medivet-security/dto/medivet-auth-login.dto';
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { MedivetAuthTokenDto } from "@/medivet-security/dto/medivet-auth-token.dto";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { UnauthorizedException } from "@nestjs/common";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { MedivetResetPasswordRequestDto } from '@/medivet-security/dto/medivet-reset-password-request.dto';
import { MedivetResetPasswordByTokenDto } from "@/medivet-security/dto/medivet-reset-password-by-token.dto";

@ApiTags(ApiTagsConstants.AUTH)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.AUTH)
export default class MedivetSecurityAuthController {
    constructor(
        private readonly securityAuthService: MedivetSecurityAuthService
    ) { }
    
    @ApiOperation({
        summary: `Generate new user's authorization token`,
        description: `Only generates when user's credentials are valid`
    })
    @ApiOkResponse({
        description: 'Returns authorization token',
        type: MedivetAuthTokenDto
    })
    @ApiBadRequestResponse({
        description: 'Wrong login form / bad credentials',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: `${ErrorMessagesConstants.USER_WITH_THIS_EMAIL_DOES_NOT_EXIST} / ${ErrorMessagesConstants.WRONG_PASSWORD}`,
        type: UnathorizedExceptionDto
        })
    @Post(PathConstants.LOGIN)
    login(
        @Body()
        authLoginDto: MedivetAuthLoginDto
    ) {
        return this.securityAuthService.login(authLoginDto);
    }

    @ApiOperation({
        summary: 'Validate user authorization token',
        description: `Check user's authorization token validation`
    })
    @ApiOkResponse({
        description: 'Authorization token is valid',
        type: OkMessageDto
    })
    @ApiUnauthorizedResponse({
        description: 'Authorization token is not valid',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.VALIDATE_TOKEN)
    async validateToken(@CurrentUser() user: MedivetUser): Promise<OkMessageDto>{
        if (!user) throw new UnauthorizedException();
        return {message: SuccessMessageConstants.TOKEN_IS_VALID}
    }

    @ApiOperation({
        summary: 'Logout user and remove used authorization token',
    })
    @ApiOkResponse({
        description: 'Authorization token has been successfully removed from database and user is logged out',
        type: OkMessageDto
    })
    @ApiUnauthorizedResponse({
        description: 'Authorization token is not valid',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post(PathConstants.LOGOUT)
    async logout(@Request() req: Request): Promise<OkMessageDto> {
        await this.securityAuthService.logout(req.headers['authorization']);
        return {message: SuccessMessageConstants.LOGOUT_USER }
    }

    @ApiOperation({
        summary: 'First generates new reset password link with new token, then sends email with this link',
        description: 'Allows only to send emails if account exists'
    })
    @ApiOkResponse({
        description: 'Returns ok message - email has been sent',
        type: OkMessageDto
    })
    @ApiNotFoundResponse({
        description: 'User with provided email does not exist, so email cannot be sent',
        type: BadRequestExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid form data',
        type: BadRequestExceptionDto
    })
    @Post(PathConstants.SEND_RESET_PASSWORD_LINK_VIA_EMAIL)
    async sendPasswordResetLinkEmail(@Body() resetPasswordRequestDto: MedivetResetPasswordRequestDto): Promise<OkMessageDto>{
        const { email } = resetPasswordRequestDto;
        await this.securityAuthService.sendResetUserPasswordLink(email);
        return { message: SuccessMessageConstants.SENT_RESET_PASSWORD_EMAIL };
    }

    @ApiOperation({
        summary: 'Resets user password by reset password token',
        description: 'Reset password token is removed after password change'
    })
    @ApiOkResponse({
        description: 'Password has been successfully changed',
        type: OkMessageDto
    })
    @ApiBadRequestResponse({
        description: 'Bad reset password token',
        type: BadRequestExceptionDto
    })
    @Post(PathConstants.RESET_PASSWORD)
    async resetPasswordByResetToken(@Body() resetPasswordByTokenDto: MedivetResetPasswordByTokenDto): Promise<OkMessageDto> {
        const { token, newPassword } = resetPasswordByTokenDto;
        await this.securityAuthService.resetUserPasswordWithToken(token, newPassword);
        return { message: SuccessMessageConstants.CHANGED_PASSWORD };
    }
}