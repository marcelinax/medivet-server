import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
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
    ) : Promise<MedivetPriceList> {
        return this.priceListsService.createPriceList(user, body);
    }
}