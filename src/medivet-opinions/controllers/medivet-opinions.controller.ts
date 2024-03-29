import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Param,
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
import { MedivetOpinionSortingModeEnum } from "@/medivet-commons/enums/enums";
import { MedivetCreateOpinionDto } from "@/medivet-opinions/dto/medivet-create-opinion.dto";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetOpinionsService } from "@/medivet-opinions/services/medivet-opinions.service";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.OPINIONS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.OPINIONS)
export class MedivetOpinionsController {
    constructor(
    private opinionsService: MedivetOpinionsService
    ) {
    }

  @ApiOperation({
      summary: "Creates new opinion for vet",
      description: "Creates new opinion for vet and than returns it"
  })
  @ApiOkResponse({
      description: "Opinion has been created successfully",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Vet cannot give himself an opinion",
      type: BadRequestExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Vet does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Post()
    async createOpinion(@CurrentUser() user: MedivetUser, @Body() body: MedivetCreateOpinionDto): Promise<MedivetOpinion> {
        return this.opinionsService.createOpinion(user, body);
    }

  @ApiOperation({
      summary: "Search authorized vet opinions",
      description: "Enables search authorized vet opinions in sorted way"
  })
  @ApiOkResponse({
      description: "Returns array of sorted authorized vet opinions",
      type: MedivetOpinion,
      isArray: true
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
  @ApiQuery({
      name: "sortingMode",
      required: false,
      enum: MedivetOpinionSortingModeEnum
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.MY)
  async searchMyOpinions(
    @CurrentUser() user: MedivetUser,
    @Query("sortingMode") sortingMode?: MedivetOpinionSortingModeEnum,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("include") include?: string
  ): Promise<MedivetOpinion[]> {
      return this.opinionsService.searchVetOpinions(user.id, {
          sortingMode,
          pageSize,
          offset,
          include
      });
  }

  @ApiOperation({ summary: "Gets authorized vet's opinion", })
  @ApiOkResponse({
      description: "Returns authorized vet's opinion with data",
      type: MedivetOpinion,
  })
  @ApiNotFoundResponse({
      description: "Vet opinion does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.MY + PathConstants.ID_PARAM)
  async getMyOpinion(
    @Param("id") opinionId: number,
    @Query("include") include?: string
  ): Promise<MedivetOpinion> {
      return this.opinionsService.findOpinionById(opinionId, include);
  }

  @ApiOperation({ summary: "Get vet opinions total amount", })
  @ApiOkResponse({
      description: "Returns total amount of vet opinions",
      type: Number,
  })
  @ApiNotFoundResponse({
      description: "Vet does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Get(`${PathConstants.ID_PARAM}/${PathConstants.AMOUNT}`)
  async getTotalAmountOfVetOpinions(
    @Param("id") vetId: number,
  ): Promise<number> {
      return this.opinionsService.getVetOpinionsTotalAmount(vetId);
  }

  @ApiOperation({
      summary: "Search vet opinions",
      description: "Enables search vet opinions in sorted way"
  })
  @ApiOkResponse({
      description: "Returns array of sorted vet opinions",
      type: MedivetOpinion,
      isArray: true
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
  @ApiQuery({
      name: "sortingMode",
      required: false,
      enum: MedivetOpinionSortingModeEnum
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
  @Get(PathConstants.ID_PARAM)
  async searchVetOpinions(
    @Param("id") vetId: number,
    @Query("sortingMode") sortingMode?: MedivetOpinionSortingModeEnum,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("include") include?: string
  ): Promise<MedivetOpinion[]> {
      return this.opinionsService.searchVetOpinions(vetId, {
          sortingMode,
          pageSize,
          offset,
          include
      });
  }

  @ApiOperation({ summary: "Reports added abused opinion", })
  @ApiOkResponse({
      description: "Returns vet opinion with status \"REPORTED\"",
      type: MedivetOpinion,
  })
  @ApiNotFoundResponse({
      description: "Opinion with this id does not exist",
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
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.MY + PathConstants.ID_PARAM + "/" + PathConstants.REPORT)
  async reportOpinion(
    @Param("id") opinionId: number,
    @Query("include") include?: string
  ): Promise<MedivetOpinion> {
      return this.opinionsService.reportOpinion(opinionId, include);
  }
}
