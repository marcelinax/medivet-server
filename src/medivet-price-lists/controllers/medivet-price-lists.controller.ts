import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { MedivetPriceListsService } from "@/medivet-price-lists/services/medivet-price-lists.service";
import { BadRequestExceptionDto } from '@/medivet-commons/dto/bad-request-exception.dto';
import { MedivetPriceList } from '@/medivet-price-lists/entities/medivet-price-list.entity';
import { UnathorizedExceptionDto } from '@/medivet-commons/dto/unauthorized-exception.dto';
import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { Role } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetRoleGuard } from "@/medivet-security/guards/medivet-role.guard";
import { JwtAuthGuard } from '@/medivet-security/guards/medivet-jwt-auth.guard';
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetCreatePriceListDto } from '@/medivet-price-lists/dto/medivet-create-price-list.dto';
import { QueryRequired } from "@/medivet-commons/decorators/QueryRequired.decorator";
import { MedivetAssignAppointmentPurposesToPriceListDto } from '@/medivet-price-lists/dto/medivet-assign-appointment-purposes-to-price-list.dto';

@ApiTags(ApiTagsConstants.PRICE_LISTS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.PRICE_LISTS)
export class MedivetPriceListsController {
    constructor(
        private priceListsService: MedivetPriceListsService
    ) { }
    
    @ApiOperation({
        summary: `Creates new price list for vet specialization`,
        description: 'Creates new price list for vet specialization in proper clinic'
    })
    @ApiNotFoundResponse({
        description: 'Clinic is not assigned to this vet / Vet specialization is not assigned to this vet',
        type: BadRequestExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid form array',
        type: BadRequestExceptionDto
    })
    @ApiOkResponse({
        description: 'Price list has been successfully created',
        type: MedivetPriceList
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createPriceList(
        @CurrentUser() user: MedivetUser,
        @Body() body: MedivetCreatePriceListDto
    ) : Promise<Partial<MedivetPriceList>> {
        return this.priceListsService.createPriceList(user, body);
    }

    @ApiOperation({
        summary: 'Gets price lists for authorized vet',
        description: 'Returns list of all price lists related with authorized vet'
    })
    @ApiOkResponse({
        description: `Returns list of all price lists related with authorized vet`,
        type: MedivetPriceList,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.MY)
    async getAllMyPriceLists(
        @CurrentUser() user: MedivetUser,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number
    ): Promise<MedivetPriceList[]> {
        return this.priceListsService.findAllMyPriceLists(
            user,
            {
                pageSize, offset
            }
        );
    }

    @ApiOperation({
        summary: 'Gets price lists for authorized vet related with his clinic',
        description: 'Returns list of all price lists related with authorized vet and his clinic'
    })
    @ApiOkResponse({
        description: `Returns list of all price lists related with authorized vet and his clinic`,
        type: MedivetPriceList,
        isArray: true
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(`${PathConstants.MY}/${PathConstants.CLINIC}${PathConstants.ID_PARAM}`)
    async getAllMyPriceListsRelatedToClinic(
        @CurrentUser() user: MedivetUser,
        @Param('id') clinicId: number,
        @Query('pageSize') pageSize: number,
        @Query('offset') offset: number
    ): Promise<MedivetPriceList[]> {
        return this.priceListsService.findAllMyPriceListsRelatedWithClinic(
            user, 
            clinicId, {
            pageSize,
            offset
        });
    }

    @ApiOperation({
        summary: 'Gets price list for authorized vet',
        description: 'Returns price list by assigned clinic and specialization'
    })
    @ApiOkResponse({
        description: `Returns assigned to authorized vet price list data`,
        type: MedivetPriceList
    })
    @ApiNotFoundResponse({
        description: 'Price list does not exist',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.MY + PathConstants.ID_PARAM)
    async getMyPriceList(
        @Param('id') id: number,
        @CurrentUser() user: MedivetUser,
        @QueryRequired('specializationId') specializationId: number,
        @QueryRequired('clinicId') clinicId: number
    ): Promise<MedivetPriceList> {
        return this.priceListsService.findMyPriceList(id, user, {
            specializationId,
            clinicId
        });
    }

    @ApiOperation({
        summary: 'Assigns appointment purpose to proper price list',
        description: 'Enables to assign appointment created by authorized vet to price list by id'
    })
    @ApiOkResponse({
        description: 'Returns price list with assigned appointment purposes',
        type: MedivetPriceList
    })
    @ApiNotFoundResponse({
        description: 'Price list does not exist / Appointment purpose does not exist',
        type: BadRequestExceptionDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid data form',
        type: BadRequestExceptionDto
    })
    @ApiUnauthorizedResponse({
        description: 'Bad authorization',
        type: UnathorizedExceptionDto
    })
    @ApiBearerAuth()
    @UseGuards(MedivetRoleGuard)
    @Role(MedivetUserRole.VET)
    @UseGuards(JwtAuthGuard)
    @Post(`${PathConstants.ID_PARAM}/${PathConstants.ASSIGN_APPOINTMENT_PURPOSES}`)
    async assignAppointmentPurposesToPriceList(
        @CurrentUser() user: MedivetUser,
        @Param('id') priceListId: number,
        @Body() body: MedivetAssignAppointmentPurposesToPriceListDto
    ): Promise<MedivetPriceList> {
        return this.priceListsService.assignAppointmentPurposesToPriceList(user, priceListId, body);
    }
}