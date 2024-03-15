import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Socket } from "socket.io";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetCreateMessageDto } from "@/medivet-messages/dto/medivet-create-message.dto";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetSecurityAuthService } from "@/medivet-security/services/medivet-security-auth.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetMessagesService {
    constructor(
    @InjectRepository(MedivetMessage) private messagesRepository: Repository<MedivetMessage>,
    private usersService: MedivetUsersService,
    private authService: MedivetSecurityAuthService
    ) {
    }

    async createMessage(
        issuer: MedivetUser,
        createMessageDto: MedivetCreateMessageDto
    ): Promise<MedivetMessage> {
        const { message, receiverId } = createMessageDto;
        const receiver = await this.usersService.findOneById(receiverId);

        await this.checkIfIssuerCanSendMessageToReceiverBasedOnUserRole(issuer, receiver);

        const newMessage = this.messagesRepository.create({
            message,
            receiver,
            receiverStatus: MedivetMessageStatus.ACTIVE,
            issuer,
            issuerStatus: MedivetMessageStatus.ACTIVE,
        });
        await this.messagesRepository.save(newMessage);

        return newMessage;
    }

    async getUserFromSocket(socket: Socket): Promise<MedivetUser> {
        const { token } = socket.handshake.auth;
        return this.authService.findUserByAuthToken(token);
    }

    async checkIfIssuerCanSendMessageToReceiverBasedOnUserRole(
        issuer: MedivetUser,
        receiver: MedivetUser
    ): Promise<void> {
        if (issuer.role === receiver.role) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.ISSUER_CANNOT_SEND_MESSAGE_TO_RECEIVER_WITH_THE_SAME_ROLE,
                    property: "all"
                }
            ]);
        }
    }
}
