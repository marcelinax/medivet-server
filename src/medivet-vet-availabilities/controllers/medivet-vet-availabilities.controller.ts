import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    ParseArrayPipe,
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
import { MedivetCreateVetAvailabilityDto } from "@/medivet-vet-availabilities/dto/medivet-create-vet-availability.dto";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetAvailabilitiesService } from "@/medivet-vet-availabilities/services/medivet-vet-availabilities.service";

@ApiTags(ApiTagsConstants.VET_AVAILABILITIES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.VET_AVAILABILITIES)
export class MedivetVetAvailabilitiesController {
    constructor(
    private vetAvailabilitiesService: MedivetVetAvailabilitiesService
    ) {
    }

  @ApiOperation({
      summary: "Creates new vet availability",
      description: "Creates new vet availability and returns it"
  })
  @ApiOkResponse({
      description: "Vet availability has been successfully created",
      type: MedivetVetAvailability
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Post()
    async createVetAvailability(
    @Body() createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
    @CurrentUser() user: MedivetUser
    ): Promise<MedivetVetAvailability> {
        return this.vetAvailabilitiesService.createVetAvailability(createVetAvailabilityDto, user);
    }

  @ApiOperation({
      summary: "Gets all vet availabilities to specific clinic and specialization",
      description: "Returns array of all vet availabilities"
  })
  @ApiOkResponse({
      description: "Returns list of all vet availabilities with specific clinic and specialization",
      type: MedivetVetAvailability,
      isArray: true
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
  @ApiQuery({
      name: "clinicId",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "vetId",
      required: false,
      type: Number
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
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllVetAvailabilities(
    @Query("include", new ParseArrayPipe({
        items: String,
        separator: ",",
        optional: true
    })) include?: string[],
    @Query("clinicId") clinicId?: number,
    @Query("vetId") vetId?: number,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
  ): Promise<MedivetVetAvailability[]> {
      return this.vetAvailabilitiesService.findAllVetAvailabilities({
          vetId,
          clinicId,
          include,
          pageSize,
          offset
      });
  }

  @ApiOperation({
      summary: "Gets vet availability",
      description: "Finds vet availability by id and returns it"
  })
  @ApiOkResponse({
      description: "Returns vet availability data",
      type: MedivetVetAvailability
  })
  @ApiNotFoundResponse({
      description: "Vet availability does not exist",
      type: BadRequestExceptionDto
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getVetAvailability(
    @Param("id") vetAvailabilityId: number,
    @Query("include", new ParseArrayPipe({
        items: String,
        separator: ",",
        optional: true
    })) include?: string[]
  ): Promise<MedivetVetAvailability> {
      return this.vetAvailabilitiesService.findVetAvailabilityById(vetAvailabilityId, include);
  }

  @ApiOperation({
      summary: "Updates vet availability",
      description: "Updates vet availability and returns it"
  })
  @ApiOkResponse({
      description: "Vet availability has been successfully updated",
      type: MedivetVetAvailability
  })
  @ApiNotFoundResponse({
      description: "Vet availability does not exist",
      type: BadRequestExceptionDto
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  async updateVetAvailability(
    @Param("id") vetAvailabilityId: number,
    @Body() createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
    @CurrentUser() user: MedivetUser
  ): Promise<MedivetVetAvailability> {
      return this.vetAvailabilitiesService.updateVetAvailability(vetAvailabilityId, createVetAvailabilityDto, user);
  }

  @ApiOperation({ summary: "Removes existing vet clinic availability", })
  @ApiNotFoundResponse({
      description: "Vet clinic availability does not exist",
      type: BadRequestExceptionDto
  })
  @ApiOkResponse({
      description: "Vet clinic availability has been removed successfully",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  async removeVetClinicAvailability(
    @Param("id") vetClinicAvailabilityId: number
  )
    : Promise<void> {
      await this.vetAvailabilitiesService.removeVetAvailability(vetClinicAvailabilityId);
  }
}
