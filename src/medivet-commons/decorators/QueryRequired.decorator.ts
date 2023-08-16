import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

export const QueryRequired = createParamDecorator((key: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const value = request.query[key];

    if (value === undefined) {
        throw new BadRequestException(`${ErrorMessagesConstants.MISSING_REQUIRED_QUERY_PARAM} ${key}`);
    }

    return value;
});
