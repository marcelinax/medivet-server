import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { SuccessMessageConstants } from '@/medivet-commons/constants/success-message.constants';
import { BadRequestExceptionDto } from '@/medivet-commons/dto/bad-request-exception.dto';
import { OkMessageDto } from '@/medivet-commons/dto/ok-message.dto';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { MedivetRoleGuard } from '@/medivet-security/guards/medivet-role.guard';
import { MedivetCreateVetSpecializationDto } from '@/medivet-users/dto/medivet-create-vet-specialization.dto';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Role } from '../decorators/medivet-role.decorator';
import { MedivetUserRole } from '../enums/medivet-user-role.enum';

@ApiTags(ApiTagsConstants.VET_SPECIALIZATION)
@Controller(PathConstants.VET_SPECIALIZATIONS)
export class MedivetVetSpecializationController {
    constructor(private vetSpecializationService: MedivetVetSpecializationService) { }

    @ApiOperation({
        summary: 'Create new vet specialization',
        description: `Creates new unique vet's specialization and returns it`
    })
    @ApiOkResponse({
        description: 'Vet specialization has been successfully created',
        type: MedivetVetSpecialization
    })
    @ApiNotFoundResponse({
        description: 'Form validation error array',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Post()
    createVetSpecialization(@Body() createVetSpecializationDto: MedivetCreateVetSpecializationDto): Promise<MedivetVetSpecialization> {
        return this.vetSpecializationService.createVetSpecialization(createVetSpecializationDto);
    }

    @ApiOperation({
        summary: 'Gets vet specialization',
        description: 'Finds vet specialization by id and returns it'
    })
    @ApiOkResponse({
        description: 'Returns vet specialization data',
        type: MedivetVetSpecialization
    })
    @ApiNotFoundResponse({
        description: 'Vet specialization does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ID_PARAM)
    async getVetSpecialization(@Param('id') vetSpecializationId: number): Promise<MedivetVetSpecialization> {
        return this.vetSpecializationService.findOneVetSpecializationById(vetSpecializationId);
    }

    @ApiOperation({
        summary: 'Removes existing vet specialization',
        description: 'Removes existing vet specialization only when it is not in use'
    })
    @ApiBadRequestResponse({
        description: 'You cannot remove vet specialization which is in use.',
        type: BadRequestExceptionDto
    })
    @ApiOkResponse({
        description: 'Vet specialization has been removed successfully',
        type: OkMessageDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Delete(PathConstants.ID_PARAM)
    async removeVetSpecialization(
        @Param('id') vetSpecializationId: number
    )
        : Promise<OkMessageDto> {
        await this.vetSpecializationService.removeVetSpecialization(vetSpecializationId);
        return { message: SuccessMessageConstants.VET_SPECIALIZATION_HAS_BEN_REMOVED_SUCCESSFULLY };
    }

    @ApiOperation({
        summary: 'Updates existing vet specialization',
        description: 'Updates existing vet specialization by id and returns it'
    })
    @ApiOkResponse({
        description: 'Vet specialization has been updated successfully',
        type: MedivetVetSpecialization
    })
    @ApiBadRequestResponse({
        description: 'Invalid array form',
        type: BadRequestExceptionDto
    })
    @ApiNotFoundResponse({
        description: 'Vet specialization id does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.ID_PARAM)
    async updateVetSpecialization(
        @Param('id') vetSpecializationId: number,
        @Body() updateVetSpecializationDto: MedivetCreateVetSpecializationDto
    ): Promise<MedivetVetSpecialization> {
        return await this.vetSpecializationService.updateVetSpecialization(vetSpecializationId, updateVetSpecializationDto);
    }

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