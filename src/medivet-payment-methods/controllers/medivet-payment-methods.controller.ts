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
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { BadRequestExceptionDto } from "@/medivet-commons/dto/bad-request-exception.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { UnauthorizedExceptionDto } from "@/medivet-commons/dto/unauthorized-exception.dto";
import { MedivetPaymentMethodStatus } from "@/medivet-commons/enums/enums";
import { MedivetCreatePaymentMethodDto } from "@/medivet-payment-methods/dto/medivet-create-payment-method.dto";
import { MedivetUpdatePaymentMethodDto } from "@/medivet-payment-methods/dto/medivet-update-payment-method.dto";
import { MedivetPaymentMethod } from "@/medivet-payment-methods/entities/medivet-payment-method.entity";
import { MedivetPaymentMethodsService } from "@/medivet-payment-methods/services/medivet-payment-methods.service";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/medivet-jwt-auth.guard";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@ApiTags(ApiTagsConstants.PAYMENT_METHODS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.PAYMENT_METHODS)
export class MedivetPaymentMethodsController {
    constructor(
    private paymentMethodsService: MedivetPaymentMethodsService
    ) {
    }

  @ApiOperation({
      summary: "Creates new payment method",
      description: "Creates new payment method and than returns it"
  })
  @ApiOkResponse({
      description: "Payment method has been created successfully",
      type: OkMessageDto
  })
  @ApiBadRequestResponse({
      description: "Payment method with name already exists",
      type: BadRequestExceptionDto
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Post()
    async createPaymentMethod(@Body() body: MedivetCreatePaymentMethodDto): Promise<MedivetPaymentMethod> {
        return this.paymentMethodsService.createPaymentMethod(body);
    }

  @ApiOperation({
      summary: "Search authorized vet opinions",
      description: "Enables search authorized vet opinions in sorted way"
  })
  @ApiOkResponse({
      description: "Returns array of payment methods",
      type: MedivetPaymentMethod,
      isArray: true
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @ApiQuery({
      name: "status",
      required: false,
      enum: MedivetPaymentMethodStatus
  })
  @ApiQuery({
      name: "offset",
      required: false,
      type: Number
  })
  @ApiQuery({
      name: "pageSize",
      required: false,
      type: Number
  })
  @ApiBearerAuth()
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchPaymentMethods(
    @CurrentUser() user: MedivetUser,
    @Query("status") status?: MedivetPaymentMethodStatus,
    @Query("pageSize") pageSize?: number,
    @Query("offset") offset?: number,
  ): Promise<MedivetPaymentMethod[]> {
      return this.paymentMethodsService.searchPaymentMethods({
          pageSize,
          offset,
      }, status);
  }

  @ApiOperation({ summary: "Gets payment method", })
  @ApiOkResponse({
      description: "Returns payment method with data",
      type: MedivetPaymentMethod,
  })
  @ApiNotFoundResponse({
      description: "Payment method does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Get(PathConstants.ID_PARAM)
  async getPaymentMethod(
    @Param("id") paymentMethodId: number,
  ): Promise<MedivetPaymentMethod> {
      return this.paymentMethodsService.findPaymentMethodById(paymentMethodId);
  }

  @ApiOperation({ summary: "Removes payment method" })
  @ApiOkResponse({
      description: "Payment method has been removed successfully",
      type: OkMessageDto
  })
  @ApiNotFoundResponse({
      description: "Payment method does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Delete(PathConstants.ID_PARAM)
  async removePaymentMethod(@Param("id") paymentMethodId: number): Promise<OkMessageDto> {
      return this.paymentMethodsService.removePaymentMethod(paymentMethodId);
  }

  @ApiOperation({ summary: "Updates payment method" })
  @ApiOkResponse({
      description: "Payment method has been updated successfully",
      type: MedivetPaymentMethod
  })
  @ApiNotFoundResponse({
      description: "Payment method does not exist",
      type: NotFoundException
  })
  @ApiUnauthorizedResponse({
      description: "Bad authorization",
      type: UnauthorizedExceptionDto
  })
  @UseGuards(MedivetRoleGuard)
  @Role([ MedivetUserRole.ADMIN ])
  @UseGuards(JwtAuthGuard)
  @Put(PathConstants.ID_PARAM)
  async updatePaymentMethod(
    @Param("id") paymentMethodId: number,
    @Body() body: MedivetUpdatePaymentMethodDto,
  ): Promise<MedivetPaymentMethod> {
      return this.paymentMethodsService.updatePaymentMethod(paymentMethodId, body);
  }
}
