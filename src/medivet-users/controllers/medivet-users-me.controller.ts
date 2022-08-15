import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { ClassSerializerInterceptor, Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { UseInterceptors } from "@nestjs/common";

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
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
    async getMe(@CurrentUser() user: MedivetUser): Promise<MedivetUser>{
        return user;
    }
}