import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
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

import { MedivetCreateAppointmentDiaryDto } from "@/medivet-appointments/dto/medivet-create-appointment-diary.dto";
import { MedivetAppointmentDiary } from "@/medivet-appointments/entities/medivet-appointment-diary.entity";
import { MedivetAppointmentDiariesService } from "@/medivet-appointments/services/medivet-appointment-diaries.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.APPOINTMENT_DIARIES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.APPOINTMENT_DIARIES)
export class MedivetAppointmentDiariesController {
    constructor(
    private appointmentDiariesService: MedivetAppointmentDiariesService
    ) {
    }

  @ApiOperation({
      summary: "Creates diary appointment to finished appointment",
      description: "Creates diary appointment if appointment finished less than 24 hours ago and returns it "
  })
  @ApiOkResponse({
      description: "Appointment diary has been successfully created",
      type: MedivetAppointmentDiary
  })
  @ApiBadRequestResponse({
      description: "Form validation error array / Is too late to create a diary / Appointment is not finished",
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
    async createAppointmentDiary(
    @Body() createAppointmentDiaryDto: MedivetCreateAppointmentDiaryDto
    ): Promise<MedivetAppointmentDiary> {
        return this.appointmentDiariesService.createAppointmentDiary(createAppointmentDiaryDto);
    }

  @ApiOperation({ summary: "Gets appointment diary by its id", })
  @ApiOkResponse({
      description: "Returns appointment diary with matched id and its data",
      type: MedivetAppointmentDiary
  })
  @ApiBadRequestResponse({
      description: "Appointment diary with this id does not exist",
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
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getAppointmentDiary(
    @Param("id") id: number,
    @Query("include") include?: string
  ): Promise<MedivetAppointmentDiary> {
      return this.appointmentDiariesService.findAppointmentDiaryById(id, include);
  }

  @ApiOperation({ summary: "Gets all animal appointment diaries", })
  @ApiOkResponse({
      description: "Returns list off all animal appointment diaries",
      type: MedivetAppointmentDiary,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "include",
      required: true,
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
      name: "medicalServiceIds",
      required: false,
      type: Array<number>
  })
  @ApiQuery({
      name: "appointmentDatte",
      required: false,
      type: Date
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ANIMAL + PathConstants.ID_PARAM)
  async getAppointmentDiariesForAnimal(
    @Param("id") id: number,
    @Query("include") include: string,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("medicalServiceIds", new ParseArrayPipe({
        items: Number,
        separator: ",",
        optional: true
    })) medicalServiceIds?: number[],
    @Query("appointmentDate") appointmentDate?: string
  ): Promise<MedivetAppointmentDiary[]> {
      return this.appointmentDiariesService.searchAppointmentDiariesForAnimal(id, {
          offset,
          pageSize,
          include,
          medicalServiceIds,
          appointmentDate
      });
  }
}
