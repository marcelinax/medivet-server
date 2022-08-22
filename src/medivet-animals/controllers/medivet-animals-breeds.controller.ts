import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedivetAnimalsBreedsService } from '@/medivet-animals/services/medivet-animals-breeds.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MedivetAnimalBreed } from '@/medivet-animals/entities/medivet-animal-breed.entity';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { MedivetCreateAnimalBreedDto } from "@/medivet-animals/dto/medivet-create-animal-breed.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@ApiTags(ApiTagsConstants.BREEDS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.BREEDS)
export class MedivetAnimalsBreedsController {
    constructor(private animalsBreedsService: MedivetAnimalsBreedsService) { }
    
    @ApiOperation({
        summary: 'Creates new animal breed',
        description: 'Creates new animal breed and returns it'
    })
    @ApiOkResponse({
        description: 'Animal breed has been successfully created',
        type: MedivetAnimalBreed
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Form validation error array',
        type: BadRequestExceptionDto
    })
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createAnimalBreed(@CurrentUser() user: MedivetUser,
        @Body() createAnimalBreedDto: MedivetCreateAnimalBreedDto): Promise<MedivetAnimalBreed> {
        return this.animalsBreedsService.createAnimalBreed(createAnimalBreedDto, user);
    }

    @ApiOperation({
        summary: 'Returns animal breed object',
        description: 'Finds animal breed by id and then returns it'
    })
    @ApiOkResponse({
        description: 'Returns animal breed object',
        type: MedivetAnimalBreed
    })
    @ApiBadRequestResponse({
        description: 'Animal breed does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.PATIENT)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ID_PARAM)
    async getAnimalBreed(@Param('id') animalBreedId: number): Promise<MedivetAnimalBreed> {
        return this.animalsBreedsService.findOneAnimalBreedById(animalBreedId);
    }
}