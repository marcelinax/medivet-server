import { ClassSerializerInterceptor, Controller, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ApiTagsConstants } from "@/medivet-commons/constants/api-tags.constants";
import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";

@ApiTags(ApiTagsConstants.MESSAGES)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(PathConstants.MESSAGES)
export class MedivetMessagesController {
    constructor(
    private messagesService: MedivetMessagesService
    ) {
    }
}
