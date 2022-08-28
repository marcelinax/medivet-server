import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { Body, ClassSerializerInterceptor, Controller, Param, Post, Put, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { MedivetClinicsReceptionTimesService } from "@/medivet-clinics/services/medivet-clinics-reception-times.service";
import { MedivetClinicsReceptionTime } from '@/medivet-clinics/entities/medivet-clinics-reception-time.entity';
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetRoleGuard } from '@/medivet-security/guards/medivet-role.guard';
import { MedivietCreateClinicsReceptionTimeDto } from "@/medivet-clinics/dto/medivet-create-clinics-reception-time.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@ApiTags(ApiTagsConstants.RECEPTION_TIMES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.RECEPTION_TIMES)
export class MedivetClinicsReceptionTimesController {
    constructor(
        private clinicsReceptionTimesService: MedivetClinicsReceptionTimesService
    ) { }
    
    @ApiOperation({
        summary: 'Creates new reception time',
        description: 'Creates new reception time and returns it'
    })
    @ApiOkResponse({
        description: 'Reception time has been successfully created',
        type: MedivetClinicsReceptionTime
    })
    @ApiBadRequestResponse({
        description: 'Vet clinic is not assigned to this vet / Vet clinic does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnauthorizedException
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createClinicReceptionTime(
        @Body() clinicReceptionTimeDto: MedivietCreateClinicsReceptionTimeDto,
        @CurrentUser() vet: MedivetUser
    ): Promise<MedivetClinicsReceptionTime> {
        return this.clinicsReceptionTimesService.createClinicReceptionTime(vet, clinicReceptionTimeDto);
    }

    @ApiOperation({
        summary: 'Updates new reception time',
        description: 'Finds new reception time by id and updates it'
    })
    @ApiOkResponse({
        description: 'Reception time has been successfully updated',
        type: MedivetClinicsReceptionTime
    })
    @ApiBadRequestResponse({
        description: 'Vet clinic is not assigned to this vet / Vet clinic does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnauthorizedException
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.UPDATE + PathConstants.ID_PARAM)
    async updateClinicReceptionTime(
        @Param('id') clinicReceptionTimeId: number,
        @Body() clinicReceptionTimeDto: MedivietCreateClinicsReceptionTimeDto,
        @CurrentUser() vet: MedivetUser
    ): Promise<MedivetClinicsReceptionTime> {
        return this.clinicsReceptionTimesService.updateClinicReceptionTime(clinicReceptionTimeId, vet, clinicReceptionTimeDto);
    }
}