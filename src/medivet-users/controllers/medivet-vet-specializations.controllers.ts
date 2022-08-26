import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { SearchDto } from "@/medivet-commons/dto/search.dto";

@ApiTags(ApiTagsConstants.VET_SPECIALIZATION)
@Controller(PathConstants.VET_SPECIALIZATIONS)
export class MedivetVetSpecializationController {
    constructor(private vetSpecializationService: MedivetVetSpecializationService) { }
    
    @ApiOperation({
        summary: 'Search for vet specializations',
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
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.SEARCH)
    async searchVetSpecializations(@Query() searchDto: SearchDto): Promise<MedivetVetSpecialization[]> {
        return this.vetSpecializationService.searchVetSpecialization(searchDto.query);
    }

    @ApiOperation({
        summary: 'Gets all vet specializations',
        description: 'Returns array of vet specializations'
    })
    @ApiOkResponse({
        description: 'Returns list of all vet specializations',
        type: MedivetVetSpecialization,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAll(): Promise<MedivetVetSpecialization[]> {
        return this.vetSpecializationService.getAllVetSpecialization();
    }
}