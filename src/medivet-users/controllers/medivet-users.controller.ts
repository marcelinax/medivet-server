import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { ErrorExceptionDto } from "@/medivet-commons/dto/error-exception.dto";
import { CreateMedivetUserDto } from "@/medivet-users/dto/create-medivet-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { ClassSerializerInterceptor, Get, Param, UseGuards } from "@nestjs/common";
import { UseInterceptors } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { Role } from "../decorators/medivet-role.decorator";
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";

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
    createMedivetUser(@Body() body: CreateMedivetUserDto): Promise<MedivetUser> {
        return this.usersService.createUser(body);
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