import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

export class MedivetUserConversation {
  user: MedivetUser;
  messages: MedivetMessage[];
  lastUpdate: Date;
  status: MedivetMessageStatus;
}
