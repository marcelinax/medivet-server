import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { MedivetStorageUserProfilePhotoInterceptor } from "@/medivet-storage/interceptors/medivet-storage-user-profile-photo.interceptor";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUpdateMyVetSpecializationsDto } from "@/medivet-users/dto/medivet-update-my-vet-specializations.dto";
import { MedivetUpdateUserDto } from "@/medivet-users/dto/medivet-update-user.dto";
import { MedivetUpdateUserPasswordDto } from "@/medivet-users/dto/medivet-update-user-password.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetAnonymizeUserService } from "@/medivet-users/services/medivet-anonymize-user.service";
import { MedivetUserProfilePhotosService } from "@/medivet-users/services/medivet-user-profile-photos.service";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@ApiTags(ApiTagsConstants.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(`${PathConstants.USERS}/${PathConstants.ME}`)
export class MedivetUsersMeController {
    constructor(
    private usersService: MedivetUsersService,
    private usersAnonymizeService: MedivetAnonymizeUserService,
    private usersProfilePhotosService: MedivetUserProfilePhotosService
    ) {
    }

  @ApiOperation({
      summary: "Get information about authorized user",
      description: "You can access user information via authorization token"
  })
  @ApiOkResponse({
      description: "Returns authorized user object",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
    async getMe(@CurrentUser() user: MedivetUser): Promise<MedivetUser> {
        return user;
    }

  @ApiOperation({
      summary: "Updates authorized user's password",
      description: "The new password and old password are required to update authorized user password"
  })
  @ApiOkResponse({
      description: "Returns authorized user with updated password",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBadRequestResponse({
      description: "Invalid old password or new password is the same as old password",
      type: BadRequestExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(PathConstants.UPDATE_PASSWORD)
  updateMyPassword(@Body() updateUserPasswordDto: MedivetUpdateUserPasswordDto,
                   @CurrentUser() user: MedivetUser): Promise<MedivetUser> {
      const { oldPassword, newPassword } = updateUserPasswordDto;
      return this.usersService.updateUserPassword(
          user,
          newPassword,
          oldPassword
      );
  }

  @ApiOperation({
      summary: "Removes and anonymizes authorized user account",
      description: "You can do it only once. This operation irreversible!"
  })
  @ApiOkResponse({
      description: "Returns successfully anonymized account message",
      type: OkMessageDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBadRequestResponse({
      description: "User account is already deleted",
      type: BadRequestExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteMe(@CurrentUser() user: MedivetUser): Promise<OkMessageDto> {
      if (!user.email) throw new BadRequestException([ ErrorMessagesConstants.USER_ACCOUNT_IS_ALREADY_DELETED ]);
      await this.usersAnonymizeService.anonymizeUser(user);
      return { message: SuccessMessageConstants.DELETED_USER_ACCOUNT };
  }

  @ApiOperation({
      summary: "Uploads new user profile photo",
      description: "First uploads new user profile photo and then returns user"
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
      description: "The new user profile photo has been uploaded",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MedivetStorageUserProfilePhotoInterceptor)
  @Post(PathConstants.UPLOAD_PROFILE_PHOTO)
  async uploadMyNewProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: MedivetUser
  ): Promise<MedivetUser> {
      return this.usersProfilePhotosService.updateUserProfilePhoto(
          user,
          file.path.replaceAll("\\", "/")
      );
  }

  @ApiOperation({
      summary: "Removes user profile photo",
      description: "First removes user profile photo and then returns user"
  })
  @ApiOkResponse({
      description: "Returns ok message",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.REMOVE_PROFILE_PHOTO)
  async removeMyProfilePhoto(@CurrentUser() user: MedivetUser): Promise<MedivetUser> {
      return this.usersProfilePhotosService.removeUserProfilePhoto(user);
  }

  @ApiOperation({
      summary: "Updates authorized user",
      description: "Updates authorized user data and returns it"
  })
  @ApiOkResponse({
      description: "Information about you has been updated successfully",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBadRequestResponse({
      description: "Form validation errors",
      type: BadRequestException
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateMe(@CurrentUser() user: MedivetUser, @Body() updateUserDto: MedivetUpdateUserDto): Promise<MedivetUser> {
      return this.usersService.updateUser(user, updateUserDto);
  }

  @ApiOperation({
      summary: "Updates authorized vet specializations",
      description: "Updates authorized vet specializations and returns vet data"
  })
  @ApiOkResponse({
      description: "Your vet specializations has been updated successfully",
      type: MedivetUser
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiNotFoundResponse({
      description: "Specialization does not exist",
      type: BadRequestException
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.VET ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.VET_SPECIALIZATIONS)
  async updateMyVetSpecializations(
    @CurrentUser() user: MedivetUser,
    @Body() updateMyVetSpecializationsDto: MedivetUpdateMyVetSpecializationsDto
  )
    : Promise<MedivetUser> {
      return this.usersService.updateMyVetSpecializations(user, updateMyVetSpecializationsDto);
  }
}
