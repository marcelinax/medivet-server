import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';

@ApiTags(ApiTagsConstants.RECEPTION_TIMES)
@Controller(PathConstants.RECEPTION_TIMES)
export class MedivetClinicsReceptionTimesController {
    
}