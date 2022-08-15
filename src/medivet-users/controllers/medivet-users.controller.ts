import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { ErrorExceptionDto } from "@/medivet-commons/dto/error-exception.dto";
import { CreateMedivetUserDto } from "@/medivet-users/dto/create-medivet-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { UseInterceptors } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

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
}