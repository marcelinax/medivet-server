import { Controller } from "@nestjs/common";
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ApiTags } from "@nestjs/swagger";
import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";

@ApiTags(ApiTagsConstants.PRICE_LISTS)
@Controller(PathConstants.PRICE_LISTS)
export class MedivetPriceListsController {
    
}