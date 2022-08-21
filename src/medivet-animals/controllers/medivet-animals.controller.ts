import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
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

@ApiTags(ApiTagsConstants.ANIMALS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.ANIMALS)
export class MedivetAnimalsController{
    constructor(private animalsService: MedivetAnimalsService) { }
    
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
}