import { ApiTagsConstants } from '@/medivet-commons/constants/api-tags.constants';
import { PathConstants } from '@/medivet-commons/constants/path.constants';
import { ClassSerializerInterceptor, Controller, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags(ApiTagsConstants.APPOINTMENTS)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.APPOINTMENTS)
export class MedivetAppointmentsController {
    constructor(

    ) { }
}
