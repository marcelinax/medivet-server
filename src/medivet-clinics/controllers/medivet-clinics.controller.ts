import { ClassSerializerInterceptor, Controller, Get, Param, Query, UseGuards, UseInterceptors, } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.CLINICS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.CLINICS)
export class MedivetClinicsController {
    constructor(private clinicsService: MedivetClinicsService) {
    }

  @ApiOperation({
      summary: "Gets all vet clinics not assigned to vet",
      description: "Returns array of all vet clinics",
  })
  @ApiOkResponse({
      description: "Returns list of all vet clinics not assigned to vet",
      type: MedivetClinic,
      isArray: true,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto,
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number,
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number,
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "search",
      required: false,
      type: String,
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.UNASSIGNED)
    async getAllClinics(@CurrentUser() user: MedivetUser,
                      @Query("pageSize") pageSize?: number,
                      @Query("offset") offset?: number,
                      @Query("include") include?: string,
                      @Query("search") search?: string,): Promise<MedivetClinic[]> {
        return this.clinicsService.getNotAssignedVetClinics(user, {
            pageSize,
            offset,
            search,
            include
        });
    }

  @ApiOperation({
      summary: "Gets all vet clinics assigned to vet",
      description: "Returns array of all vet clinics assigned to vet",
  })
  @ApiOkResponse({
      description: "Returns list of all vet clinics assigned to vet",
      type: MedivetClinic,
      isArray: true,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto,
  })
  @ApiQuery({
      name: "search",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ASSIGNED)
  async getAllClinicsAssignedToVet(
    @CurrentUser() user: MedivetUser,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("search") search?: string,
    @Query("include") include?: string
  ): Promise<MedivetClinic[]> {
      return this.clinicsService.getAssignedVetClinics(user.id, {
          search,
          pageSize,
          offset,
      }, include);
  }

  @ApiOperation({
      summary: "Gets vet clinic",
      description: "Finds vet clinic by id and returns it",
  })
  @ApiOkResponse({
      description: "Returns vet clinic data",
      type: MedivetClinic,
  })
  @ApiNotFoundResponse({
      description: "Vet clinic does not exist",
      type: BadRequestExceptionDto,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto,
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getClinic(
    @Param("id") clinicId: number,
    @Query("include") include?: string
  ): Promise<MedivetClinic> {
      return this.clinicsService.findClinicById(clinicId, include);
  }
}
