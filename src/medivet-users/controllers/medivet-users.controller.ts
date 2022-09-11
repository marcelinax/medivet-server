import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { ErrorExceptionDto } from "@/medivet-commons/dto/error-exception.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { ClassSerializerInterceptor, Get, Param, Query, UseGuards } from "@nestjs/common";
import { UseInterceptors } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { Role } from "../decorators/medivet-role.decorator";
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetCreateUserDto } from '@/medivet-users/dto/medivet-create-user.dto';
import { MedivetGenderEnum } from '@/medivet-commons/enums/medivet-gender.enum';
import { MedivetSortingModeEnum } from '@/medivet-commons/enums/medivet-sorting-mode.enum';

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.USERS)
export class MedivetUsersController {
    constructor(private usersService: MedivetUsersService){}

    @ApiOperation({
        summary: 'Create new user',
        description: 'Accepts only new user with unique email.'
    })
    @ApiCreatedResponse({
        description: 'User has been successfully crated.',
        type: MedivetUser
    })
    @ApiConflictResponse({
        description: 'User with this email already exists.',
        type: ErrorExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Not all fields were presented.',
        type: BadRequestExceptionDto
        })
    @Post()
    createMedivetUser(@Body() body: MedivetCreateUserDto): Promise<MedivetUser> {
        return this.usersService.createUser(body);
    }

    @ApiOperation({
        summary: 'Search vets',
        description: 'Enables search vets with sorting and pagination'
    })
    @ApiOkResponse({
        description: 'Returns list of all matched vets data',
        type: MedivetUser,
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
    @Get(`${PathConstants.VET}/${PathConstants.SEARCH}`)
    async searchVets(
        @Query('name') name: string,
        @Query('clinicName') clinicName: string,
        @Query('city') city: string,
        @Query('specializationIds') specializationIds: string,
        @Query('gender') gender: MedivetGenderEnum,
        @Query('sortingMode') sortingMode: MedivetSortingModeEnum,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number,
    ): Promise<MedivetUser[]> {
        return this.usersService.searchVets({
            name,
            clinicName,
            city,
            specializationIds,
            gender,
            sortingMode,
            pageSize,
            offset
        });
    }

    @ApiOperation({
        summary: 'Gets vet by id',
        description: 'Returns matched vet data'
    })
    @ApiOkResponse({
        description: 'Returns vet',
        type: MedivetUser
    })
    @ApiNotFoundResponse({
        description: 'Vet does not exist',
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
    @Get(PathConstants.VET + PathConstants.ID_PARAM)
    async getVet(
        @Param('id') userId: number
    ): Promise<MedivetUser> {
        return this.usersService.findVetById(userId);
    }
}