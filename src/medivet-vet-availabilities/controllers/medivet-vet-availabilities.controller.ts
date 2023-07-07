import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetCreateVetAvailabilityDto } from '@/medivet-vet-availabilities/dto/medivet-create-vet-availability.dto';
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetAvailabilitiesService } from "@/medivet-vet-availabilities/services/medivet-vet-availabilities.service";
import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags(ApiTagsConstants.VET_AVAILABILITY)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.VET_AVAILABILITIES)
export class MedivetVetAvailabilitiesController {
    constructor(
        private vetAvailabilitiesService: MedivetVetAvailabilitiesService
    ) { }

    @ApiOperation({
        summary: 'Creates new vet availability',
        description: 'Creates new vet availability and returns it'
    })
    @ApiOkResponse({
        description: 'Vet availability has been successfully created',
        type: MedivetVetAvailability
    })
    @ApiBadRequestResponse({
        description: 'Form validation error array',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createVetAvailability(
        @Body() createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
        @CurrentUser() user: MedivetUser
    ): Promise<MedivetVetAvailability> {
        return this.vetAvailabilitiesService.createVetAvailability(createVetAvailabilityDto, user);
    }
}