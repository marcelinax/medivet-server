import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    ParseArrayPipe,
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
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MedivetCreateAppointmentDto } from "@/medivet-appointments/dto/medivet-create-appointment.dto";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetAppointmentStatus } from "@/medivet-commons/enums/enums";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.APPOINTMENTS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.APPOINTMENTS)
export class MedivetAppointmentsController {
    constructor(private appointmentsService: MedivetAppointmentsService) {
    }

  @ApiOperation({
      summary: "Creates new appointment",
      description: "Creates new appointment and returns it"
  })
  @ApiOkResponse({
      description: "Appointment has been successfully created",
      type: MedivetAppointment
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
  @Role([ MedivetUserRole.VET, MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Post()
    async createAppointment(
    @Body() createAppointmentDto: MedivetCreateAppointmentDto
    ): Promise<MedivetAppointment> {
        return this.appointmentsService.createAppointment(createAppointmentDto);
    }

  @ApiOperation({ summary: "Gets all user appointments filtered by status", })
  @ApiOkResponse({
      description: "Returns list off all user appointments",
      type: MedivetAppointment,
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
      name: "status",
      required: false,
      enum: MedivetAppointmentStatus
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAppointments(
    @CurrentUser() user: MedivetUser,
    @Query("status") status: MedivetAppointmentStatus,
    @Query("pageSize") pageSize: number,
    @Query("offset") offset: number,
    @Query("include", new ParseArrayPipe({
        items: String,
        optional: true,
        separator: ","
    })) include?: string[]
  ): Promise<MedivetAppointment[]> {
      return this.appointmentsService.getAppointments(user, {
          offset,
          pageSize,
          status,
          include
      });
  }
}
