import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetAnimalStatusEnum, MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetStorageAnimalProfilePhotoInterceptor } from "@/medivet-storage/interceptors/medivet-storage-animal-profile-photo.interceptor";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.ANIMALS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMALS)
export class MedivetAnimalsController {
    constructor(
    private animalsService: MedivetAnimalsService,
    private animalsProfilePhotosService: MedivetAnimalProfilePhotosService,
    ) {
    }

  @ApiOperation({
      summary: "Create new animal",
      description: "Creates new user's animal and returns it"
  })
  @ApiOkResponse({
      description: "Animal has been successfully created",
      type: MedivetAnimal
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
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Post()
    createAnimal(@CurrentUser() owner: MedivetUser, @Body() createAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
        return this.animalsService.createAnimal(createAnimalDto, owner);
    }

  @ApiOperation({
      summary: "Get authorized owner's animals",
      description: "Enables get owner's animal searching by name"
  })
  @ApiOkResponse({
      description: "Returns list off all authorized owner's animals",
      type: MedivetAnimal,
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
      name: "sortingMode",
      type: String,
      required: false
  })
  @ApiQuery({
      name: "search",
      type: String,
      required: false
  })
  @ApiQuery({
      name: "status",
      enum: MedivetAnimalStatusEnum,
      required: false
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.MY)
  getMyAnimals(
    @CurrentUser() owner: MedivetUser,
    @Query("search") search?: string,
    @Query("sortingMode") sortingMode?: MedivetSortingModeEnum,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
    @Query("include") include?: string,
    @Query("status") status?: MedivetAnimalStatusEnum,
  ): Promise<MedivetAnimal[]> {
      return this.animalsService.searchAllAnimalsAssignedToOwner(owner, {
          search,
          sortingMode,
          pageSize,
          offset,
          include,
          status
      });
  }

  @ApiOperation({ summary: "Get animal by id", })
  @ApiOkResponse({
      description: "Returns animal with data",
      type: MedivetAnimal
  })
  @ApiNotFoundResponse({
      description: "Animal does not exist",
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
  @Role([ MedivetUserRole.PATIENT, MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getAnimal(
    @Param("id") animalId: number,
    @Query("include") include: string,
  ): Promise<MedivetAnimal> {
      return this.animalsService.findOneAnimalById(animalId, include);
  }

  @ApiOperation({
      summary: "Uploads new animal profile photo",
      description: "First uploads new animal profile photo, then returns animal"
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
      schema: {
          type: "object",
          properties: {
              file: {
                  type: "string",
                  format: "binary",
              },
          },
      },
  })
  @ApiCreatedResponse({
      description: "The new animal profile photo has been uploaded",
      type: MedivetAnimal
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MedivetStorageAnimalProfilePhotoInterceptor)
  @Post(PathConstants.UPLOAD_PROFILE_PHOTO + PathConstants.ID_PARAM)
  async uploadNewAnimalProfilePhoto(
    @UploadedFile() file: Express.Multer.File, @Param("id") animalId: number
  ): Promise<MedivetAnimal> {
      const animal = await this.animalsService.findOneAnimalById(animalId, "breed,coatColor");
      return this.animalsProfilePhotosService.updateAnimalProfilePhoto(animal, file.path.replaceAll("\\", "/"));
  }

  @ApiOperation({
      summary: "Removes animal profile photo",
      description: "First removes animal profile photo and then returns animal"
  })
  @ApiOkResponse({
      description: "Returns ok message",
      type: MedivetAnimal
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.REMOVE_PROFILE_PHOTO + PathConstants.ID_PARAM)
  async removeAnimalProfilePhoto(@Param("id") animalId: number): Promise<MedivetAnimal> {
      const animal = await this.animalsService.findOneAnimalById(animalId, "breed,coatColor");
      return this.animalsProfilePhotosService.removeAnimalProfilePhoto(animal);
  }

  @ApiOperation({
      summary: "Updates animal object by id",
      description: "Finds created animal by id, updates it and then returns animal object only when user is its owner"
  })
  @ApiOkResponse({
      description: "Returns updated animal object",
      type: MedivetAnimal
  })
  @ApiNotFoundResponse({
      description: "Animal does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization / user is not animal's owner",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.PATIENT ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.UPDATE + PathConstants.ID_PARAM)
  async updateAnimal(
    @Param("id") animalId: number,
    @CurrentUser() user: MedivetUser,
    @Body() updateAnimalDto: MedivetCreateAnimalDto,
  ): Promise<MedivetAnimal> {
      return this.animalsService.updateAnimal(animalId, user, updateAnimalDto);
  }

  @ApiOperation({
      summary: "Archives animal by id",
      description: "Archives owner's animal"
  })
  @ApiOkResponse({
      description: "Returns updated animal object",
      type: MedivetAnimal
  })
  @ApiNotFoundResponse({
      description: "Animal does not exist",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization / user is not animal's owner",
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
  @Put(PathConstants.ARCHIVE + PathConstants.ID_PARAM)
  async archiveAnimal(
    @Param("id") animalId: number,
    @CurrentUser() user: MedivetUser,
    @Query("include") include?: string
  ): Promise<MedivetAnimal> {
      const animal = await this.animalsService.findOneAnimalById(animalId, include);
      return this.animalsService.archiveAnimal(animal, user);
  }

  @ApiOperation({
      summary: "Restores animal by id",
      description: "Restores owner's animal"
  })
  @ApiOkResponse({
      description: "Returns updated animal object",
      type: MedivetAnimal
  })
  @ApiNotFoundResponse({
      description: "Animal does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization / user is not animal's owner",
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
  @Put(PathConstants.RESTORE + PathConstants.ID_PARAM)
  async restoreAnimal(
    @Param("id") animalId: number,
    @CurrentUser() user: MedivetUser,
    @Query("include") include?: string
  ): Promise<MedivetAnimal> {
      const animal = await this.animalsService.findOneAnimalById(animalId, include);
      return this.animalsService.restoreAnimal(animal, user);
  }
}
