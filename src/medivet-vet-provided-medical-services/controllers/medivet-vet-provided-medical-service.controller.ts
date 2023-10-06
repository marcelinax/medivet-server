import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseArrayPipe,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetCreateVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-create-vet-provided-medical-service.dto";
import { MedivetUpdateVetProvidedMedicalServiceDto } from "@/medivet-vet-provided-medical-services/dto/medivet-update-vet-provided-medical-service.dto";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@ApiTags(ApiTagsConstants.VET_PROVIDED_MEDICAL_SERVICES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.VET_PROVIDED_MEDICAL_SERVICES)
export class MedivetVetProvidedMedicalServiceController {
    constructor(
    private vetProvidedMedicalServiceService: MedivetVetProvidedMedicalServiceService
    ) {
    }

  @ApiOperation({
      summary: "Create new vet provided medical service",
      description: "Creates new vet provided medical service and returns it"
  })
  @ApiOkResponse({
      description: "Vet provided medical service has been successfully created",
      type: MedivetVetProvidedMedicalService
  })
  @ApiNotFoundResponse({
      description: "Form validation error array",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role(MedivetUserRole.VET)
  @UseGuards(JwtAuthGuard)
  @Post()
    createVetProvidedMedicalService(
    @CurrentUser() vet: MedivetUser,
    @Body() createVetProvidedMedicalServiceDto: MedivetCreateVetProvidedMedicalServiceDto
    ): Promise<MedivetVetProvidedMedicalService> {
        return this.vetProvidedMedicalServiceService.createVetProvidedMedicalService(createVetProvidedMedicalServiceDto, vet);
    }

  @ApiOperation({
      summary: "Gets vet provided medical service",
      description: "Finds vet provided medical service by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns vet provided medical service data",
      type: MedivetVetProvidedMedicalService
  })
  @ApiNotFoundResponse({
      description: "Vet provided medical service does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: Array<string>
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role(MedivetUserRole.VET)
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getVetSpecializationMedicalService(
    @Param("id") vetProvidedMedicalServiceId: number,
    @Query("include", new ParseArrayPipe({
        items: String,
        separator: ",",
        optional: true
    })) include?: string[]
  ): Promise<MedivetVetProvidedMedicalService> {
      return this.vetProvidedMedicalServiceService.findVetProvidedMedicalServiceById(vetProvidedMedicalServiceId, include);
  }

  @ApiOperation({
      summary: "Gets vet provided medical services filtered by params",
      description: "Returns array of matched vet provided medical services"
  })
  @ApiOkResponse({
      description: "Returns array of matched vet provided medical services",
      type: MedivetVetProvidedMedicalService,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "vetId",
      required: true,
      type: Number
  })
  @ApiQuery({
      name: "include",
      required: false,
      type: Array<string>
  })
  @ApiQuery({
      name: "specializationIds",
      required: false,
      type: Array<number>
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(`/${PathConstants.CLINIC}${PathConstants.ID_PARAM}`)
  async searchVetProvidedMedicalServices(
    @Param("id") clinicId: number,
    @Query("vetId") vetId: number,
    @Query("specializationIds", new ParseArrayPipe({
        items: Number,
        separator: ",",
        optional: true
    })) specializationIds?: number[],
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("include", new ParseArrayPipe({
        items: String,
        separator: ",",
        optional: true
    })) include?: string[]
  ): Promise<MedivetVetProvidedMedicalService[]> {
      return this.vetProvidedMedicalServiceService.searchVetProvidedMedicalServicesForClinic(
          clinicId,
          {
              specializationIds,
              include,
              pageSize,
              offset,
              vetId
          },
      );
  }

  @ApiOperation({
      summary: "Updates vet provided medical service",
      description: "Updates vet provided medical service and returns it"
  })
  @ApiOkResponse({
      description: "Vet provided medical service has been successfully updated",
      type: MedivetVetProvidedMedicalService
  })
  @ApiNotFoundResponse({
      description: "Form validation error array",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role(MedivetUserRole.VET)
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  updateVetProvidedMedicalService(
    @Param("id") vetProvidedMedicalServiceId: number,
    @Body() updateVetProvidedMedicalServiceDto: MedivetUpdateVetProvidedMedicalServiceDto
  ): Promise<MedivetVetProvidedMedicalService> {
      return this.vetProvidedMedicalServiceService.updateVetProvidedMedicalService(vetProvidedMedicalServiceId, updateVetProvidedMedicalServiceDto);
  }

  @ApiOperation({ summary: "Removes existing vet clinic provided medical service", })
  @ApiNotFoundResponse({
      description: "Vet clinic provided medical service does not exist",
      type: NotFoundException
  })
  @ApiOkResponse({
      description: "Vet clinic provided medical service has been removed successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role(MedivetUserRole.VET)
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  async removeVetProvidedMedicalService(
    @Param("id") vetProvidedMedicalServiceId: number
  )
    : Promise<OkMessageDto> {
      return this.vetProvidedMedicalServiceService.removeVetProvidedMedicalService(vetProvidedMedicalServiceId);
  }
}
