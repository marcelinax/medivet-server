import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/jwt-auth.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@ApiTags(ApiTagsConstants.USERS)
@Controller(`${PathConstants.USERS}/${PathConstants.ME}`)
export class MedivetUsersMeController {

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
    getMe(@CurrentUser() user): Promise<MedivetUser>{
        return user;
    }
}