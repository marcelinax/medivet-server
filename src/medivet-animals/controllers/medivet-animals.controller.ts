import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { MedivetStorageAnimalProfilePhotoInterceptor } from '@/medivet-storage/interceptors/medivet-storage-animal-profile-photo.interceptor';
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

@ApiTags(ApiTagsConstants.ANIMALS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMALS)
export class MedivetAnimalsController{
    constructor(
        private animalsService: MedivetAnimalsService,
        private animalsProfilePhotosService: MedivetAnimalProfilePhotosService
    ) { }
    
    @ApiOperation({
        summary: 'Create new animal',
        description: `Creates new user's animal and returns it`
    })
    @ApiOkResponse({
        description: 'Animal has been successfully created',
        type: MedivetAnimal
    })
    @ApiNotFoundResponse({
        description: 'Form validation error array',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Post()
    createAnimal(@CurrentUser() owner: MedivetUser, @Body() createAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
        return this.animalsService.createAnimal(createAnimalDto, owner);
    }

    @ApiOperation({
        summary: `Search authorized owner's animals`,
        description: `Enables search owner's animal by it's name`
    })
    @ApiOkResponse({
        description: `Returns list off all authorized owner's animals`,
        type: MedivetAnimal,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.SEARCH + '/' + PathConstants.MY)
    getMyAnimals(
        @CurrentUser() owner: MedivetUser,
        @Query('animalName') animalName: string,
        @Query('sortingMode') sortingMode: MedivetSortingModeEnum,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number,
    ): Promise<MedivetAnimal[]> {
        return this.animalsService.serachAllAnimalsAssignedToOwner(owner, {
            animalName,
            sortingMode,
            pageSize,
            offset
        });
    }

    @ApiOperation({
        summary: 'Uploads new animal profile photo',
        description: 'First uploads new animal profile photo, then returns animal'
    })
    @ApiConsumes('multipart/form-data')
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
        description: 'The new animal profile photo has been uploaded',
        type: MedivetAnimal
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MedivetStorageAnimalProfilePhotoInterceptor)
    @Post(PathConstants.UPLOAD_PROFILE_PHOTO + PathConstants.ID_PARAM)
    async uploadNewAnimalProfilePhoto(@UploadedFile() file: Express.Multer.File, @Param('id') animalId: number) {
        const animal = await this.animalsService.findOneAnimalById(animalId);
        return this.animalsProfilePhotosService.updateAnimalProfilePhoto(animal, file.path.replaceAll('\\', '/'));
    }

    @ApiOperation({
        summary: 'Removes animal profile photo',
        description: 'First removes animal profile photo and then returns animal'
    })
    @ApiOkResponse({
        description: 'Returns ok message',
        type: MedivetAnimal
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Delete(PathConstants.REMOVE_PROFILE_PHOTO + PathConstants.ID_PARAM)
    async removeAnimalProfilePhoto(@Param('id') animalId: number) {
        const animal = await this.animalsService.findOneAnimalById(animalId);
        return this.animalsProfilePhotosService.removeAnimalProfilePhoto(animal);
    }

    @ApiOperation({
        summary: 'Returns animal object',
        description: 'Finds animal by id and then returns it'
    })
    @ApiOkResponse({
        description: 'Returns animal object',
        type: MedivetAnimal
    })
    @ApiBadRequestResponse({
        description: 'Animal does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ID_PARAM)
    async getAnimal(@Param('id') animalId: number): Promise<MedivetAnimal> {
        return this.animalsService.findOneAnimalById(animalId);
    }

    @ApiOperation({
        summary: 'Updates animal object by id',
        description: 'Finds created animal by id, updates it and then returns animal object only when user is its owner'
    })
    @ApiOkResponse({
        description: 'Returns updated animal object',
        type: MedivetAnimal
    })
    @ApiNotFoundResponse({
        description: 'Animal does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: `Bad authorization / user is not animal's owner`,
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.UPDATE + PathConstants.ID_PARAM)
    async updateAnimal(
        @Param('id') animalId: number,
        @CurrentUser() user: MedivetUser,
        @Body() updateAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
            return this.animalsService.updateAnimal(animalId, user, updateAnimalDto);
    }

    @ApiOperation({
        summary: 'Archives animal by id',
        description: `Archives owner's animal`
    })
    @ApiOkResponse({
        description: 'Returns updated animal object',
        type: MedivetAnimal
    })
    @ApiNotFoundResponse({
        description: 'Animal does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: `Bad authorization / user is not animal's owner`,
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.ARCHVIE + PathConstants.ID_PARAM)
    async archivieAnimal(
        @Param('id') animalId: number,
        @CurrentUser() user: MedivetUser
    ): Promise<MedivetAnimal> {
            const animal = await this.animalsService.findOneAnimalById(animalId);
            return this.animalsService.archiveAnimal(animal, user);
    }

    @ApiOperation({
        summary: 'Restores animal by id',
        description: `Restores owner's animal`
    })
    @ApiOkResponse({
        description: 'Returns updated animal object',
        type: MedivetAnimal
    })
    @ApiNotFoundResponse({
        description: 'Animal does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: `Bad authorization / user is not animal's owner`,
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.RESTORE + PathConstants.ID_PARAM)
    async restoreAnimal(
        @Param('id') animalId: number,
        @CurrentUser() user: MedivetUser
    ): Promise<MedivetAnimal> {
            const animal = await this.animalsService.findOneAnimalById(animalId);
            return this.animalsService.restoreAnimal(animal, user);
    }

}