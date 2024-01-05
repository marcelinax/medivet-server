import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
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

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetCreateVetSpecializationMedicalServiceDto } from "@/medivet-specializations/dto/medivet-create-vet-specialization-medical-service.dto";
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecializationMedicalServiceService } from "@/medivet-specializations/services/medivet-vet-specialization-medical-service.service";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.VET_SPECIALIZATION_MEDICAL_SERVICES)
@Controller(PathConstants.VET_SPECIALIZATION_MEDICAL_SERVICES)
export class MedivetVetSpecializationMedicalServiceController {
    constructor(private vetSpecializationMedicalServiceService: MedivetVetSpecializationMedicalServiceService) {
    }

  @ApiOperation({
      summary: "Create new vet specialization medical service",
      description: "Creates new unique vet's specialization medical service and returns it"
  })
  @ApiOkResponse({
      description: "Vet specialization medical service has been successfully created",
      type: MedivetVetSpecializationMedicalService
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
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post()
    createVetSpecializationMedicalService(@Body() createVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto): Promise<MedivetVetSpecializationMedicalService> {
        return this.vetSpecializationMedicalServiceService.createVetSpecializationMedicalService(createVetSpecializationMedicalServiceDto);
    }

  @ApiOperation({
      summary: "Gets vet specialization medical service",
      description: "Finds vet specialization medical service by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns vet specialization medical service data",
      type: MedivetVetSpecializationMedicalService
  })
  @ApiNotFoundResponse({
      description: "Vet specialization medical service does not exist",
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
  async getVetSpecializationMedicalService(
    @Param("id") vetSpecializationMedicalServiceId: number,
    @Query("include") include?: string
  ): Promise<MedivetVetSpecializationMedicalService> {
      return this.vetSpecializationMedicalServiceService.findOneVetSpecializationMedicalServiceById(vetSpecializationMedicalServiceId, include);
  }

  @ApiOperation({
      summary: "Gets vet specialization medical services filtered by params",
      description: "Returns array of matched vet specialization medical services"
  })
  @ApiOkResponse({
      description: "Returns array of matched vet specialization medical services",
      type: MedivetVetSpecializationMedicalService,
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
      name: "search",
      required: false,
      type: String
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
  @ApiQuery({
      name: "specializationIds",
      required: false,
      type: Array<number>
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchVetSpecializationMedicalServices(
    @Query("pageSize") pageSize: number,
    @Query("offset") offset?: number,
    @Query("search") search?: string,
    @Query("include") include?: string,
    @Query("specializationIds", new ParseArrayPipe({
        items: Number,
        separator: ",",
        optional: true
    })) specializationIds?: number[],
  ): Promise<MedivetVetSpecializationMedicalService[]> {
      return this.vetSpecializationMedicalServiceService.searchVetSpecializationMedicalServices({
          pageSize,
          offset,
          search,
          include,
          specializationIds
      });
  }

  @ApiOperation({
      summary: "Removes existing vet specialization medical service",
      description: "Removes existing vet specialization medical service only when it is not in use"
  })
  @ApiBadRequestResponse({
      description: "You cannot remove vet specialization medical service which is in use.",
      type: BadRequestExceptionDto
  })
  @ApiOkResponse({
      description: "Vet specialization medical service has been removed successfully",
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
  async removeVetSpecializationMedicalService(
    @Param("id") vetSpecializationMedicalServiceId: number
  )
    : Promise<OkMessageDto> {
      return this.vetSpecializationMedicalServiceService.removeVetSpecializationMedicalService(vetSpecializationMedicalServiceId);
  }

  @ApiQuery({
      name: "include",
      required: false,
      type: String
  })
  @ApiOperation({
      summary: "Updates existing vet specialization medical service",
      description: "Updates existing vet specialization medical service by id and returns it"
  })
  @ApiOkResponse({
      description: "Vet specialization medical service has been updated successfully",
      type: MedivetVetSpecializationMedicalService
  })
  @ApiBadRequestResponse({
      description: "Invalid array form",
      type: BadRequestExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Vet specialization medical service id does not exist",
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
  async updateVetSpecialization(
    @Param("id") vetSpecializationMedicalServiceId: number,
    @Body() updateVetSpecializationMedicalServiceDto: MedivetCreateVetSpecializationMedicalServiceDto,
    @Query("include") include?: string
  ): Promise<MedivetVetSpecializationMedicalService> {
      return this.vetSpecializationMedicalServiceService.updateVetSpecializationMedicalService(
          vetSpecializationMedicalServiceId,
          updateVetSpecializationMedicalServiceDto,
          include
      );
  }
}
