import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
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
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetVacationStatus } from "@/medivet-commons/enums/enums";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetCreateVacationDto } from "@/medivet-vacations/dto/medivet-create-vacation.dto";
import { MedivetVacation } from "@/medivet-vacations/entities/medivet-vacation.entity";
import { MedivetVacationService } from "@/medivet-vacations/services/medivet-vacation.service";

@ApiTags(ApiTagsConstants.VACATIONS)
@Controller(PathConstants.VACATIONS)
export class MedivetVacationController {
    constructor(private vacationService: MedivetVacationService) {
    }

  @ApiOperation({ summary: "Creates new vacation for vet", })
  @ApiOkResponse({
      description: "Vacation has been successfully created",
      type: MedivetVetSpecialization
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Post()
    createVetSpecialization(
    @CurrentUser() user: MedivetUser,
    @Body() createVacation: MedivetCreateVacationDto
    ): Promise<MedivetVacation> {
        return this.vacationService.createVacation(user, createVacation);
    }

  @ApiOperation({ summary: "Gets all user's vacations filtered by status", })
  @ApiOkResponse({
      description: "Returns array of matched user's vacations",
      type: MedivetVacation,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
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
      enum: MedivetVacationStatus
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchUserVacations(
    @CurrentUser() user: MedivetUser,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("status") status?: MedivetVacationStatus
  ): Promise<MedivetVacation[]> {
      return this.vacationService.searchVacationsForUser(user, {
          pageSize,
          offset,
      }, status);
  }

  @ApiOperation({ summary: "Gets user's vacation", })
  @ApiOkResponse({
      description: "Returns user's vacation and it's data",
      type: MedivetVacation,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getUserVacation(
    @CurrentUser() user: MedivetUser,
    @Param("id") vacationId: number,
  ): Promise<MedivetVacation> {
      return this.vacationService.findVacationById(vacationId, user);
  }

  @ApiOperation({
      summary: "Cancels created user's vacation",
      description: "Cancels user's vacation if it's status is equal to \"ACTIVE\""
  })
  @ApiOkResponse({
      description: "Vacation has been cancelled successfully",
      type: MedivetVacation,
  })
  @ApiNotFoundResponse({ description: "Vacation with this id does not exist" })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM + "/" + PathConstants.CANCEL)
  async cancelVacation(
    @CurrentUser() user: MedivetUser,
    @Param("id") vacationId: number
  ): Promise<MedivetVacation> {
      return this.vacationService.cancelVacation(user, vacationId);
  }

  @ApiOperation({
      summary: "Updates created user's vacation",
      description: "Updates user's vacation's date from and date"
  })
  @ApiOkResponse({
      description: "Vacation has been updated successfully",
      type: MedivetVacation,
  })
  @ApiNotFoundResponse({ description: "Vacation with this id does not exist" })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  async updateVacation(
    @CurrentUser() user: MedivetUser,
    @Param("id") vacationId: number,
    @Body() updateDto: MedivetCreateVacationDto
  ): Promise<MedivetVacation> {
      return this.vacationService.updateVacation(user, vacationId, updateDto);
  }
}
