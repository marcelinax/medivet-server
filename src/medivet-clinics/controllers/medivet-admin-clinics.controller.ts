import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.ADMIN_CLINICS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ADMIN_CLINICS)
export class MedivetAdminClinicsController {

    constructor(private clinicsService: MedivetClinicsService) {
    }

  @ApiOperation({
      summary: "Creates new vet clinic",
      description: "Creates new vet clinic and returns it"
  })
  @ApiOkResponse({
      description: "Vet clinic has been successfully created",
      type: MedivetClinic
  })
  @ApiBadRequestResponse({
      description: "Form validation error array",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post()
    async createClinic(
    @Body() createClinicDto: MedivetCreateClinicDto
    ): Promise<MedivetClinic> {
        return this.clinicsService.createClinic(createClinicDto);
    }

  // przerobić na filtry
  @ApiOperation({
      summary: "Gets all vet clinics",
      description: "Returns array of all vet clinics"
  })
  @ApiOkResponse({
      description: "Returns list of all vet clinics",
      type: MedivetClinic,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "name",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "city",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "buildingNumber",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "flatNumber",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "street",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "sortingMode",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "notAssigned",
      required: false,
      type: Boolean
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET, MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllClinics(
    @Query("pageSize") pageSize: number,
    @Query("offset") offset: number,
    @Query("name") name?: string,
    @Query("city") city?: string,
    @Query("zipCode") zipCode?: string,
    @Query("buildingNumber") buildingNumber?: number,
    @Query("flatNumber") flatNumber?: number,
    @Query("street") street?: string,
    @Query("sortingMode") sortingMode?: MedivetSortingModeEnum,
    @Query("include") include?: string,
    @Query("search") search?: string
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
          sortingMode,
          search
      });
  }

  @ApiOperation({
      summary: "Gets vet clinic",
      description: "Finds vet clinic by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns vet clinic data",
      type: MedivetClinic
  })
  @ApiNotFoundResponse({
      description: "Vet clinic does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getClinic(
    @Param("id") clinicId: number,
    @Query("include") include?: string
  ): Promise<MedivetClinic> {
      return this.clinicsService.findClinicById(clinicId, include);
  }

  @ApiOperation({
      summary: "Removes existing clinic",
      description: "Enables only when user is its creator and clinic is not in used"
  })
  @ApiBadRequestResponse({
      description: "You cannot remove clinic which is in use / You are not a clinic creator",
      type: BadRequestExceptionDto
  })
  @ApiOkResponse({
      description: "Clinic has been removed successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  async removeClinic(
    @Param("id") clinicId: number
  )
    : Promise<OkMessageDto> {
      await this.clinicsService.removeClinic(clinicId);
      return { message: SuccessMessageConstants.VET_CLINIC_HAS_BEEN_REMOVED_SUCCESSFULLY };
  }

  @ApiOperation({
      summary: "Updates existing vet clinic",
      description: "Updates existing vet clinic by id and returns it"
  })
  @ApiOkResponse({
      description: "Vet clinic has been updated successfully",
      type: MedivetClinic
  })
  @ApiBadRequestResponse({
      description: "Invalid array form",
      type: BadRequestExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Clinic id does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  async updateClinic(
    @Param("id") clinicId: number,
    @Body() updateClinicDto: MedivetCreateClinicDto
  ): Promise<MedivetClinic> {
      return this.clinicsService.updateClinic(clinicId, updateClinicDto);
  }
}
