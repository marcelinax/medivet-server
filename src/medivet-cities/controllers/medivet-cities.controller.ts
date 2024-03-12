import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { MedivetCitiesService } from "@/medivet-cities/services/medivet-cities.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";

@ApiTags(ApiTagsConstants.CITIES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.CITIES)
export class MedivetCitiesController {
    constructor(private citiesService: MedivetCitiesService) {

    }

  @ApiOperation({
      summary: "Gets cities from database",
      description: "Returns cities based on clinics in database",
  })
  @ApiOkResponse({
      description: "Returns list of cities",
      type: String,
      isArray: true,
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto,
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number,
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number,
  })
  @ApiQuery({
      name: "search",
      required: false,
      type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
    async getCities(
    @Query("offset") offset?: number,
    @Query("pageSize") pageSize?: number,
    @Query("search") search?: string,
    ): Promise<string[]> {
        return this.citiesService.getCities({
            offset,
            pageSize
        }, search);
    }

}
