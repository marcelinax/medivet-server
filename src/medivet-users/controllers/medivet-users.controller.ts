import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
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
import { ErrorExceptionDto } from "@/medivet-commons/dto/error-exception.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetAvailableDatesFilter, MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetCreateUserDto } from "@/medivet-users/dto/medivet-create-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.USERS)
export class MedivetUsersController {
    constructor(private usersService: MedivetUsersService) {
    }

  @ApiOperation({
      summary: "Create new user",
      description: "Accepts only new user with unique email."
  })
  @ApiCreatedResponse({
      description: "User has been successfully crated.",
      type: MedivetUser
  })
  @ApiConflictResponse({
      description: "User with this email already exists.",
      type: ErrorExceptionDto
  })
  @ApiBadRequestResponse({
      description: "Not all fields were presented.",
      type: BadRequestExceptionDto
  })
  @Post()
    createMedivetUser(@Body() body: MedivetCreateUserDto): Promise<MedivetUser> {
        return this.usersService.createUser(body);
    }

  @ApiOperation({
      summary: "Gets vets filterd by queries",
      description: "Enables gets filtered and sorted vets"
  })
  @ApiOkResponse({
      description: "Returns list of all matched vets data",
      type: MedivetUser,
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
      name: "city",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "specializationIds",
      required: true,
      type: String
  })
  @ApiQuery({
      name: "clinicName",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "medicalServiceIds",
      required: false,
      type: String
  })
  @ApiQuery({
      name: "sortingMode",
      required: false,
      enum: MedivetSortingModeEnum
  })
  @ApiQuery({
      name: "availableDates",
      required: false,
      enum: MedivetAvailableDatesFilter
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
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Get(`${PathConstants.VETS}`)
  async getVets(
    @Query("city") city: string,
    @Query("specializationIds") specializationIds: string,
    @Query("pageSize") pageSize: number,
    @Query("offset") offset: number,
    @Query("clinicName") clinicName?: string,
    @Query("name") name?: string,
    @Query("medicalServiceIds") medicalServiceIds?: string,
    @Query("sortingMode") sortingMode?: MedivetSortingModeEnum,
    @Query("availableDates") availableDates?: MedivetAvailableDatesFilter,
    @Query("include") include?: string
  ): Promise<MedivetUser[]> {
      return this.usersService.searchVets({
          name,
          clinicName,
          city,
          specializationIds,
          medicalServiceIds,
          availableDates,
          sortingMode,
          pageSize,
          offset,
          include
      });
  }

  @ApiOperation({
      summary: "Gets vet by id",
      description: "Returns matched vet data"
  })
  @ApiOkResponse({
      description: "Returns vet",
      type: MedivetUser
  })
  @ApiNotFoundResponse({
      description: "Vet does not exist",
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
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.VETS + PathConstants.ID_PARAM)
  async getVet(
    @Param("id") userId: number,
    @Query("include") include?: string
  ): Promise<MedivetUser> {
      return this.usersService.findVetById(userId, include);
  }
}
