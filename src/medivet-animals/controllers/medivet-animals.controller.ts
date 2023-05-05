import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalProfilePhotosService } from "@/medivet-animals/services/medivet-animal-profile-photos.service";
import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { UnathorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetStorageAnimalProfilePhotoInterceptor } from '@/medivet-storage/interceptors/medivet-storage-animal-profile-photo.interceptor';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, NotFoundException, Param, ParseArrayPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags(ApiTagsConstants.ANIMALS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMALS)
export class MedivetAnimalsController {
    constructor(
        private animalsService: MedivetAnimalsService,
        private animalsProfilePhotosService: MedivetAnimalProfilePhotosService,
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
    @ApiQuery({ name: 'include', type: Array<String>, required: false })
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
        @Query('include', new ParseArrayPipe({ items: String, optional: true, separator: ',' })) include?: string[]
    ): Promise<MedivetAnimal[]> {
        return this.animalsService.serachAllAnimalsAssignedToOwner(owner, {
            animalName,
            sortingMode,
            pageSize,
            offset,
            include
        });
    }

    @ApiOperation({
        summary: `Get authorized user animal by id`,
        description: `Returns authorized user's animal if it is its owner`
    })
    @ApiOkResponse({
        description: `Returns owner's animal`,
        type: MedivetAnimal
    })
    @ApiNotFoundResponse({
        description: 'Animal does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization / user is not owner for animal',
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.MY + PathConstants.ID_PARAM)
    async getOwnerAnimal(
        @CurrentUser() owner: MedivetUser,
        @Param('id') animalId: number,
        @Query('include', new ParseArrayPipe({ items: String, optional: true, separator: ',' })) include?: string[]
    ): Promise<MedivetAnimal> {
        return this.animalsService.findOneAnimalAssignedToOwner(animalId, owner, include);
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
    async uploadNewAnimalProfilePhoto(
        @UploadedFile() file: Express.Multer.File, @Param('id') animalId: number) {
        const animal = await this.animalsService.findOneAnimalById(animalId, ['breed', 'coatColor']);
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
        const animal = await this.animalsService.findOneAnimalById(animalId, ['breed', 'coatColor']);
        return this.animalsProfilePhotosService.removeAnimalProfilePhoto(animal);
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
        @Body() updateAnimalDto: MedivetCreateAnimalDto,
    ): Promise<MedivetAnimal> {
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
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.ARCHVIE + PathConstants.ID_PARAM)
    async archivieAnimal(
        @Param('id') animalId: number,
        @CurrentUser() user: MedivetUser,
        @Query('include', new ParseArrayPipe({ items: String, optional: true, separator: ',' })) include?: string[]
    ): Promise<MedivetAnimal> {
        const animal = await this.animalsService.findOneAnimalById(animalId, include);
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
        type: NotFoundException
    })
    @ApiUnauthorizedResponse({
        description: `Bad authorization / user is not animal's owner`,
        type: UnathorizedExceptionDto
    })
    @ApiQuery({ name: 'include', required: false, type: Array<String> })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Put(PathConstants.RESTORE + PathConstants.ID_PARAM)
    async restoreAnimal(
        @Param('id') animalId: number,
        @CurrentUser() user: MedivetUser,
        @Query('include', new ParseArrayPipe({ items: String, optional: true, separator: ',' })) include?: string[]
    ): Promise<MedivetAnimal> {
        const animal = await this.animalsService.findOneAnimalById(animalId, include);
        return this.animalsService.restoreAnimal(animal, user);
    }
}