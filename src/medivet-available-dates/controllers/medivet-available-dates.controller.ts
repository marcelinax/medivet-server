import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { MedivetAvailableDate } from "@/medivet-available-dates/entities/medivet-available-date.entity";
import { MedivetAvailableDatesService } from "@/medivet-available-dates/services/medivet-available-dates.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";

@ApiTags(ApiTagsConstants.AVAILABLE_DATES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.AVAILABLE_DATES)
export class MedivetAvailableDatesController {
    constructor(
    private availableDatesService: MedivetAvailableDatesService
    ) {
    }

  @ApiOperation({
      summary: "Gets first available appointment date one month in advance for specific medical service",
      description: "Finds first available appointment date one month in advance for specific medical service and returns it"
  })
  @ApiOkResponse({
      description: "Returns first available appointment date one month in advance for specific medical service",
      type: MedivetAvailableDate,
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
      name: "medicalServiceId",
      required: true,
      type: Number
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.FIRST_AVAILABLE)
    async getFirstAvailableDateForMedicalService(
    @Query("vetId") vetId: number,
    @Query("medicalServiceId") medicalServiceId: number,
    ): Promise<any> {
        return this.availableDatesService.getFirstAvailableDateForMedicalService(vetId, medicalServiceId);
    }

  @ApiOperation({
      summary: "Gets all available appointment dates one month in advance for specific medical service",
      description: "Finds all available appointment dates one month in advance for specific medical service and returns them"
  })
  @ApiOkResponse({
      description: "Returns available appointment dates one month in advance for specific medical service",
      type: MedivetAvailableDate,
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
      name: "medicalServiceId",
      required: true,
      type: Number
  })
  @ApiQuery({
      name: "month",
      required: false,
      type: Number
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAvailableDatesForMedicalService(
    @Query("vetId") vetId: number,
    @Query("medicalServiceId") medicalServiceId: number,
    @Query("month") month?: number,
  ): Promise<any[]> {
      return this.availableDatesService.getAvailableDatesForMedicalService(vetId, medicalServiceId, { month });
  }
}
