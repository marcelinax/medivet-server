import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MedivetClinicAssignmentRequest } from "@/medivet-clinics/entities/medivet-clinic-assignment-request.entity";
import { MedivetClinicAssignmentRequestService } from "@/medivet-clinics/services/medivet-clinic-assignment-requests.service";
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

@ApiTags(ApiTagsConstants.CLINIC_ASSIGNMENT_REQUESTS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.CLINIC_ASSIGNMENT_REQUESTS)
export class MedivetClinicAssignmentRequestsController {
    constructor(private clinicAssignmentRequestsService: MedivetClinicAssignmentRequestService) {
    }

  @ApiOperation({ summary: "Sends request to confirm assignment", })
  @ApiOkResponse({
      description: "Request has been sent",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Can't assign already assigned clinic",
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
  @Post(`${PathConstants.CLINIC_ID_PARAM}/${PathConstants.ASSIGNMENT_REQUEST}`)
    async requestToAssignClinic(
    @CurrentUser() user: MedivetUser,
    @Param("clinicId") clinicId: number,
    ): Promise<OkMessageDto> {
        return this.clinicAssignmentRequestsService.requestToAssignClinic(user, clinicId);
    }

  @ApiOperation({ summary: "Sends request to confirm unassignment", })
  @ApiOkResponse({
      description: "Request has been sent",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Can't assign not assigned clinic",
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
  @Post(`${PathConstants.CLINIC_ID_PARAM}/${PathConstants.UNASSIGNMENT_REQUEST}`)
  async requestToUnassignClinic(
    @CurrentUser() user: MedivetUser,
    @Param("clinicId") clinicId: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.requestToUnassignToClinic(user, clinicId);
  }

  @ApiOperation({
      summary: "Confirms clinic assignment",
      description: "Assigns clinic to vet"
  })
  @ApiOkResponse({
      description: "Clinic has been assigned",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Clinic assignmnet request does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post(`${PathConstants.ID_PARAM}/${PathConstants.UNASSIGNMENT_CONFIRMATION}`)
  async confirmClinicAssignment(
    @Param("id") id: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.confirmClinicAssignment(id);
  }

  @ApiOperation({ summary: "Rejects clinic assignment", })
  @ApiOkResponse({
      description: "Request has been rejected",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Clinic assignmnet request does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post(`${PathConstants.ID_PARAM}/${PathConstants.ASSIGNMENT_REJECTION}`)
  async rejectClinicAssignment(
    @Param("id") id: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.rejectClinicAssignment(id);
  }

  @ApiOperation({
      summary: "Confirms clinic unassignment",
      description: "Unassigns clinic to vet"
  })
  @ApiOkResponse({
      description: "Clinic has been unassigned",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Clinic unassignmnet request does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post(`${PathConstants.ID_PARAM}/${PathConstants.UNASSIGNMENT_CONFIRMATION}`)
  async confirmClinicUnassignment(
    @Param("id") id: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.confirmClinicUnassignment(id);
  }

  @ApiOperation({ summary: "Rejects clinic unassignment", })
  @ApiOkResponse({
      description: "Request has been rejected",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Clinic unassignmnet request does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post(`${PathConstants.ID_PARAM}/${PathConstants.ASSIGNMENT_REJECTION}`)
  async rejectClinicUnssignment(
    @Param("id") id: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.rejectClinicUnassignment(id);
  }

  @ApiOperation({ summary: "Cancels clinic unassignment request.", })
  @ApiOkResponse({
      description: "Clinic unassignment request has been cancelled",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Clinic unassignmnet request does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Post(`${PathConstants.CLINIC_ID_PARAM}/${PathConstants.UNASSGINMENT_CANCELLATION}`)
  async cancelClinicUnssignment(
    @CurrentUser() user: MedivetUser,
    @Param("clinicId") clinicId: number,
  ): Promise<OkMessageDto> {
      return this.clinicAssignmentRequestsService.cancelClinicUnassignment(clinicId, user);
  }

  @ApiOperation({
      summary: "Gets all clinic assignment requests",
      description: "Returns array of all clinic assignment requests"
  })
  @ApiOkResponse({
      description: "Returns list of all clinic assignment requests",
      type: MedivetClinicAssignmentRequest,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllClinicAssignmentRequests(
    @Query("pageSize") pageSize: number,
    @Query("offset") offset: number,
  ): Promise<MedivetClinicAssignmentRequest[]> {
      return this.clinicAssignmentRequestsService.searchClinicRequestAssignments({
          pageSize,
          offset
      });
  }
}
