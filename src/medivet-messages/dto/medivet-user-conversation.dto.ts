import { ApiProperty } from "@nestjs/swagger";

import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

export class MedivetUserConversationDto {
  @ApiProperty({ example: MedivetUser })
  user: MedivetUser;

  @ApiProperty({ example: MedivetMessage })
  messages: MedivetMessage[];

  @ApiProperty({ example: new Date() })
  lastUpdate: Date;

  @ApiProperty({ example: MedivetMessageStatus.ACTIVE })
  status: MedivetMessageStatus;
}
