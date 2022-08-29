import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetCreateClinicDto } from '@/medivet-clinics/dto/medivet-create-clinic.dto';
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { BadRequestExceptionDto } from '@/medivet-commons/dto/bad-request-exception.dto';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';

@ApiTags(ApiTagsConstants.CLINICS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.CLINICS)
export class MedivetClinicsController {
    
    constructor(private clinicsService: MedivetClinicsService) {}

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
    @Role(MedivetUserRole.VET)
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
    @ApiBadRequestResponse({
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
        @CurrentUser() user: MedivetUser
    ): Promise<MedivetUser> {
        return this.clinicsService.assignVetToClinic(user, clinicId);
    }

    @ApiOperation({
        summary: 'Unassigns vet clinics from vet',
        description: 'Unasssigns vet clinics from vet and returns vet'
    })
    @ApiOkResponse({
        description: 'Vet clinic has been successfully unassigned from vet',
        type: MedivetUser
    })
    @ApiBadRequestResponse({
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
    ): Promise<MedivetUser> {
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
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get() 
    async getAllClinics(): Promise<MedivetClinic[]> {
        return this.clinicsService.findAllClinics();
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
        @Query('pageSize') pageSize: number, @Query('offset') offset: number
    ): Promise<MedivetClinic[]> {
        return this.clinicsService.searchClinics({
            name,
            city,
            street,
            zipCode,
            flatNumber,
            buildingNumber,
            pageSize,
            offset
        });
    };

    @ApiOperation({
        summary: 'Gets vet clinic',
        description: 'Finds vet clinic by id and returns it'
    })
    @ApiOkResponse({
        description: 'Returns vet clinic data',
        type: MedivetClinic
    })
    @ApiBadRequestResponse({
        description: 'Vet clinic does not exist',
        type:BadRequestExceptionDto
        })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ID_PARAM) 
    async getClinic(@Param('id') clinicId: number): Promise<MedivetClinic> {
        return this.clinicsService.findClinicById(clinicId);
    }
}