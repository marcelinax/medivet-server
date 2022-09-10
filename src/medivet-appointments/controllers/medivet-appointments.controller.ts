import { Body, ClassSerializerInterceptor, Controller, Get, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { MedivetAppointmentPurposesService } from '@/medivet-appointments/services/medivet-appointment-purposes.service';
import { MedivetAppointmentPurpose } from '@/medivet-appointments/entities/medivet-appointment-purpose.entity';
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateAppointmentPurposeDto } from '@/medivet-appointments/dto/medivet-create-appointment-purpose.dto';
import { MedivetSearchAppointmentPurposeDto } from '@/medivet-appointments/dto/medivet-search-appointment-purpose.dto';

@ApiTags(ApiTagsConstants.APPOINTMENTS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.APPOINTMENTS)
export class MedivetAppointmentsController {
    constructor(
        private appointmentPurposesService: MedivetAppointmentPurposesService
    ) { }
    
    @ApiOperation({
        summary: `Creates new appointment purpose`,
        description: `Created appointment purpose is assigned to vet's specialization`
    })
    @ApiOkResponse({
        description: 'Appointment purpose has been created successfully',
        type: MedivetAppointmentPurpose
    })
    @ApiBadRequestResponse({
        description: 'Invalid array form ',
        type: BadRequestExceptionDto
    })
    @ApiNotFoundResponse({
        description: 'Clinic is not assigned to vet/ Vet specialization is not assigned to vet',
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
    @Post(PathConstants.PURPOSE)
    async createAppointmentPurpose(
        @CurrentUser() user: MedivetUser,
        @Body() body: MedivetCreateAppointmentPurposeDto
    ): Promise<MedivetAppointmentPurpose> {
        return this.appointmentPurposesService.createAppointmentPurpose(user, body);
    }

    @ApiOperation({
        summary: `Updates appointment purpose`,
        description: `Updates appointment purpose assigned to vet's specialization and returns it`
    })
    @ApiOkResponse({
        description: 'Appointment purpose has been updated successfully',
        type: MedivetAppointmentPurpose
    })
    @ApiNotFoundResponse({
        description: 'Appointment purpose does not exist / Clinic is not assigned to vet/ Vet specialization is not assigned to vet',
        type: BadRequestExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid array form',
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
    @Put(PathConstants.PURPOSE + PathConstants.ID_PARAM)
    async updateAppointmentPurpose(
        @CurrentUser() user: MedivetUser,
        @Body() body: MedivetCreateAppointmentPurposeDto
    ): Promise<MedivetAppointmentPurpose> {
        return this.appointmentPurposesService.updateAppointmentPurpose(user, body);
    }

    @ApiOperation({
        summary: `Search authorized vet's appointment purposes`,
        description: 'Only gets appointment purposes which are associated with clinic and specialization'
    })
    @ApiOkResponse({
        description: `Returns list of all authorized vet's appointment purposes`,
        type: MedivetAppointmentPurpose,
        isArray: true
    })
    @ApiBadRequestResponse({
        description: 'Appointment purposes is not associated with clinic and specialization',
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
    @Get(`${PathConstants.PURPOSE}/${PathConstants.SEARCH}`)
    async searchAppointmentPurposes(
        @CurrentUser() user: MedivetUser,
        @Query('clinicId') clinicId: number,
        @Query('specializationId') specializationId: number,
        @Query('name') name: string,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number,
    ): Promise<MedivetAppointmentPurpose[]> {
        return this.appointmentPurposesService.searchAppointmentPurposes(user, {
            clinicId,
            specializationId,
            name,
            pageSize,
            offset
        });
    }
}
