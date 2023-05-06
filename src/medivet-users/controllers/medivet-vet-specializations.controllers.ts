import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags(ApiTagsConstants.VET_SPECIALIZATION)
@Controller(PathConstants.VET_SPECIALIZATIONS)
export class MedivetVetSpecializationController {
    constructor(private vetSpecializationService: MedivetVetSpecializationService) { }

    @ApiOperation({
        summary: 'Gets vet specializations filtered by params',
        description: 'Returns array of matched vet specializations'
    })
    @ApiOkResponse({
        description: 'Returns array of matched vet specializations',
        type: MedivetVetSpecialization,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async searchVetSpecializations(
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number,
        @Query('search') search?: string
    ): Promise<MedivetVetSpecialization[]> {
        return this.vetSpecializationService.searchVetSpecialization({
            pageSize,
            offset,
            search
        });
    }
}