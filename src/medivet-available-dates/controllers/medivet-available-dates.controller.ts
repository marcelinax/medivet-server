import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { MedivetAvailableDatesService } from "@/medivet-available-dates/services/medivet-available-dates.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";

@ApiTags(ApiTagsConstants.AVAILABLE_DATES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.AVAILABLE_DATES)
export class MedivetAvailableDatesController {
    constructor(
    private availableDatesService: MedivetAvailableDatesService
    ) {
    }

  // @ApiOperation({
  //   summary: "Gets vet provided medical service",
  //   description: "Finds vet provided medical service by id and returns it"
  // })
  // @ApiOkResponse({
  //   description: "Returns vet provided medical service data",
  //   type: MedivetVetProvidedMedicalService
  // })
  // @ApiNotFoundResponse({
  //   description: "Vet provided medical service does not exist",
  //   type: NotFoundException
  // })
  // @ApiUnauthorizedResponse({
  //   description: "Bad authorization",
  //   type: UnauthorizedExceptionDto
  // })
  // @ApiQuery({
  //   name: "include",
  //   required: false,
  //   type: Array<string>
  // })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
    async getVetSpecializationMedicalService(
    @Query("vetId") vetId?: number,
    @Query("medicalServiceId") medicalServiceId?: number,
    @Query("month") month?: number,
    ): Promise<any[]> {
        return this.availableDatesService.getAvailableDatesForMedicalService(vetId, medicalServiceId, { month });
    }
}
