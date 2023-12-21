import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
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
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
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
}
