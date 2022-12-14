import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { MedivetOpinionsService } from '@/medivet-opinions/services/medivet-opinions.service';
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { BadRequestExceptionDto } from '@/medivet-commons/dto/bad-request-exception.dto';
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetCreateOpinionDto } from '@/medivet-opinions/dto/medivet-create-opinion.dto';
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetOpinion } from '@/medivet-opinions/entities/medivet-opinion.entity';
import { MedivetSearchOpinionDto } from '@/medivet-opinions/dto/medivet-search-opinion.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

@ApiTags(ApiTagsConstants.OPINIONS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.OPINIONS)
export class MedivetOpinionsController {
    constructor(
        private opinionsService: MedivetOpinionsService
    ) { }
    
    @ApiOperation({
        summary: `Creates new opinion for vet`,
        description: 'Creates new opinion for vet and than returns it'
    })
    @ApiOkResponse({
        description: 'Opinion has been created successfully',
        type: OkMessageDto
    })
    @ApiBadRequestResponse({
        description: 'Vet cannot give himself an opinion',
        type: BadRequestExceptionDto
    })
    @ApiNotFoundResponse({
        description: 'Vet does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createOpinion(@CurrentUser() user: MedivetUser, @Body() body: MedivetCreateOpinionDto) { 
        return this.opinionsService.createOpinion(user, body);
    }

    @ApiOperation({
        summary: 'Search authorized vet opinions',
        description: 'Enables search authorized vet opinions in sorted way'
    })
    @ApiOkResponse({
        description: 'Returns array of sorted authorized vet opinions',
        type: MedivetOpinion,
        isArray: true
    })
    @ApiNotFoundResponse({
        description: 'Vet does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.SEARCH) 
    async searchMyOpinions(
        @CurrentUser() user: MedivetUser,
        @Query('sortingMode') sortingMode: MedivetSortingModeEnum,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number
    ): Promise<MedivetOpinion[]> {
        return this.opinionsService.searchVetOpinions(user.id, {
            sortingMode,
            pageSize,
            offset
        });
    }

    @ApiOperation({
        summary: 'Search vet opinions',
        description: 'Enables search vet opinions in sorted way'
    })
    @ApiOkResponse({
        description: 'Returns array of sorted vet opinions',
        type: MedivetOpinion,
        isArray: true
    })
    @ApiNotFoundResponse({
        description: 'Vet does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.SEARCH + PathConstants.ID_PARAM)
    async searchVetOpinions(
        @Param('id') vetId: number,
        @Query('sortingMode') sortingMode: MedivetSortingModeEnum,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number
    ): Promise<MedivetOpinion[]> {
        return this.opinionsService.searchVetOpinions(vetId, {
            sortingMode,
            pageSize,
            offset
        });
    }
}