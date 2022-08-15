import { Body, Controller, Post } from "@nestjs/common";
import { MedivetSecurityAuthService } from "@/medivet-security/services/medivet-security-auth.service";
import { MedivetAuthLoginDto } from '@/medivet-security/dto/medivet-auth-login.dto';
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { MedivetAuthTokenDto } from "@/medivet-security/dto/medivet-auth-token.dto";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";

@ApiTags(ApiTagsConstants.AUTH)
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
}