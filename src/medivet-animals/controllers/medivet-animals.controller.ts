import { Body, ClassSerializerInterceptor, Controller, Delete, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
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
        const animal = await this.animalsService.findOneById(animalId);
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
        const animal = await this.animalsService.findOneById(animalId);
        return this.animalsProfilePhotosService.removeAnimalProfilePhoto(animal);
    }

}