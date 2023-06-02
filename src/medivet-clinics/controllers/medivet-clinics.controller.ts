import { MedivetAssignVetToClinicDto } from '@/medivet-clinics/dto/medivet-assign-vet-to-clinic.dto';
import { MedivetCreateClinicDto } from '@/medivet-clinics/dto/medivet-create-clinic.dto';
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { SuccessMessageConstants } from '@/medivet-commons/constants/success-message.constants';
import { BadRequestExceptionDto } from '@/medivet-commons/dto/bad-request-exception.dto';
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseArrayPipe, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags(ApiTagsConstants.CLINICS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.CLINICS)
export class MedivetClinicsController {

    constructor(private clinicsService: MedivetClinicsService) { }

    @ApiOperation({
        summary: 'Creates new vet clinic',
        description: 'Creates new vet clinic and returns it'
    })
    @ApiOkResponse({
        description: 'Vet clinic has been successfully created',
        type: MedivetClinic
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
    @Role(MedivetUserRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createClinic(
        @Body() createClinicDto: MedivetCreateClinicDto
    ): Promise<MedivetClinic> {
        return this.clinicsService.createClinic(createClinicDto);
    }

    @ApiOperation({
        summary: 'Assigns vet clinics to vet',
        description: 'Assigns vet clinics to vet and returns vet'
    })
    @ApiOkResponse({
        description: 'Vet clinic has been successfully assigned to vet',
        type: MedivetUser
    })
    @ApiNotFoundResponse({
        description: 'Vet clinic does not exist',
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
    @Post(PathConstants.ASSIGN_VET + PathConstants.ID_PARAM)
    async assignClinicToVet(
        @Param('id') clinicId: number,
        @CurrentUser() user: MedivetUser,
        @Body() body: MedivetAssignVetToClinicDto
    ): Promise<MedivetUser> {
        return this.clinicsService.assignVetToClinic(user, clinicId, {
            specializationIds: body.specializationIds
        });
    }

    @ApiOperation({
        summary: 'Unassigns vet clinics from vet',
        description: 'Unasssigns vet clinics from vet and returns vet'
    })
    @ApiOkResponse({
        description: 'Vet clinic has been successfully unassigned from vet',
        type: MedivetUser
    })
    @ApiNotFoundResponse({
        description: 'Vet clinic does not exist',
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
    @Delete(PathConstants.UNASSIGN_VET + PathConstants.ID_PARAM)
    async unassignClinicFromVet(
        @Param('id') clinicId: number,
        @CurrentUser() user: MedivetUser
    ): Promise<OkMessageDto> {
        return this.clinicsService.unassignVetFromClinic(user, clinicId);
    }

    @ApiOperation({
        summary: 'Gets all vet clinics',
        description: 'Returns array of all vet clinics'
    })
    @ApiOkResponse({
        description: 'Returns list of all vet clinics',
        type: MedivetClinic,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllClinics(
        @Query('include', new ParseArrayPipe({ items: String, separator: ',', optional: true })) include?: string[]
    ): Promise<MedivetClinic[]> {
        return this.clinicsService.findAllClinics(include);
    }

    @ApiOperation({
        summary: 'Search vet clinics',
        description: 'Enables search vet clinics by name and address'
    })
    @ApiOkResponse({
        description: 'Returns array of matched vet clinics',
        type: MedivetClinic,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.SEARCH)
    async searchClinics(
        @Query('name') name: string, @Query('city') city: string,
        @Query('zipCode') zipCode: string, @Query('buildingNumber') buildingNumber: number,
        @Query('flatNumber') flatNumber: number, @Query('street') street: string,
        @Query('pageSize') pageSize: number, @Query('offset') offset: number,
        @Query('sortingMode') sortingMode: MedivetSortingModeEnum
    ): Promise<MedivetClinic[]> {
        return this.clinicsService.searchClinics({
            name,
            city,
            street,
            zipCode,
            flatNumber,
            buildingNumber,
            pageSize,
            offset,
            sortingMode
        });
    };

    @ApiOperation({
        summary: 'Gets all vet clinics assigned to vet',
        description: 'Returns array of all vet clinics assigned to vet'
    })
    @ApiOkResponse({
        description: 'Returns list of all vet clinics assigned to vet',
        type: MedivetClinic,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ASSIGNED_TO_VET)
    async getAllClinicsAssignedToVet(
        @CurrentUser() user: MedivetUser,
        @Query('pageSize') pageSize: number, @Query('offset') offset: number,
        @Query('include', new ParseArrayPipe({ items: String, separator: ',', optional: true })) include?: string[]
    ): Promise<MedivetClinic[]> {
        return this.clinicsService.findClinicsAssignedToVet(user.id, { pageSize, offset }, include);
    }

    @ApiOperation({
        summary: 'Gets vet clinic',
        description: 'Finds vet clinic by id and returns it'
    })
    @ApiOkResponse({
        description: 'Returns vet clinic data',
        type: MedivetClinic
    })
    @ApiNotFoundResponse({
        description: 'Vet clinic does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ID_PARAM)
    async getClinic(
        @Param('id') clinicId: number,
        @Query('include', new ParseArrayPipe({ items: String, separator: ',', optional: true })) include?: string[]
    ): Promise<MedivetClinic> {
        return this.clinicsService.findClinicById(clinicId);
    }

    @ApiOperation({
        summary: 'Removes existing clinic',
        description: 'Enables only when user is its creator and clinic is not in used'
    })
    @ApiBadRequestResponse({
        description: 'You cannot remove clinic which is in use / You are not a clinic creator',
        type: BadRequestExceptionDto
    })
    @ApiOkResponse({
        description: 'Clinic has been removed successfully',
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
    async removeClinic(
        @Param('id') clinicId: number
    )
        : Promise<OkMessageDto> {
        await this.clinicsService.removeClinic(clinicId);
        return { message: SuccessMessageConstants.VET_CLINIC_HAS_BEEN_REMOVED_SUCCESSFULLY };
    }

    @ApiOperation({
        summary: 'Updates existing vet clinic',
        description: 'Updates existing vet clinic by id and returns it'
    })
    @ApiOkResponse({
        description: 'Vet clinic has been updated successfully',
        type: MedivetClinic
    })
    @ApiBadRequestResponse({
        description: 'Invalid array form',
        type: BadRequestExceptionDto
    })
    @ApiNotFoundResponse({
        description: 'Clinic id does not exist',
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
    async updateClinic(
        @Param('id') clinicId: number,
        @Body() updateClinicDto: MedivetCreateClinicDto
    ): Promise<MedivetClinic> {
        return await this.clinicsService.updateClinic(clinicId, updateClinicDto);
    }
}