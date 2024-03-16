import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Socket } from "socket.io";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetCreateMessageDto } from "@/medivet-messages/dto/medivet-create-message.dto";
import { MedivetSearchMessageDto } from "@/medivet-messages/dto/medivet-search-message.dto";
import { MedivetUpdateMessageDto } from "@/medivet-messages/dto/medivet-update-message.dto";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetUserConversation } from "@/medivet-messages/types/types";
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

    async searchAllUserConversations(
        user: MedivetUser,
        searchDto: MedivetSearchMessageDto
    ): Promise<MedivetUserConversation[]> {
        const relations = [ "issuer", "receiver" ];
        const { status, offset, pageSize } = searchDto;

        const sentMessages = await this.messagesRepository.find({
            relations,
            where: { issuer: { id: user.id }, }
        });
        const receivedMessages = await this.messagesRepository.find({
            relations,
            where: { receiver: { id: user.id }, }
        });
        let conversations: MedivetUserConversation[] = [];

        sentMessages.forEach(sentMessage => {
            const { receiver } = sentMessage;
            const conversationWithReceiver: MedivetUserConversation | undefined = conversations.find(conversation => conversation.user.id === receiver.id);
            if (conversationWithReceiver) {
                conversationWithReceiver.messages = [ ...conversationWithReceiver.messages, sentMessage ];
            } else {
                conversations.push({
                    user: receiver,
                    messages: [ sentMessage ],
                    status: sentMessage.issuerStatus,
                    lastUpdate: sentMessage.createdAt
                });
            }
        });

        receivedMessages.forEach(receivedMessage => {
            const { issuer } = receivedMessage;
            const conversationWithIssuer: MedivetUserConversation | undefined = conversations.find(conversation => conversation.user.id === issuer.id);
            if (conversationWithIssuer) {
                conversationWithIssuer.messages = [ ...conversationWithIssuer.messages, receivedMessage ];
            } else {
                conversations.push({
                    user: issuer,
                    messages: [ receivedMessage ],
                    status: receivedMessage.receiverStatus,
                    lastUpdate: receivedMessage.createdAt
                });
            }
        });

        conversations.forEach(conversation => {
            conversation.messages.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
            conversation.lastUpdate = conversation.messages[conversation.messages.length - 1].createdAt;
        });

        switch (status) {
            case MedivetMessageStatus.ARCHIVED:
                conversations = conversations.filter(message => message.status == MedivetMessageStatus.ARCHIVED);
                break;
            case MedivetMessageStatus.ACTIVE:
            default:
                conversations = conversations.filter(message => message.status == MedivetMessageStatus.ACTIVE);
                break;
        }

        return paginateData(conversations, {
            pageSize,
            offset
        });
    }

    async changeConversationStatus(
        user: MedivetUser,
        updateMessageDto: MedivetUpdateMessageDto,
    ): Promise<OkMessageDto> {
        const { status, userId } = updateMessageDto;
        const sentMessages = await this.messagesRepository.find({
            where: {
                receiver: { id: userId },
                issuer: { id: user.id }
            },
            relations: [ "issuer", "receiver" ]
        });

        await this.validateConversationStatus(sentMessages, true, status);

        for (const sentMessage of sentMessages) {
            sentMessage.issuerStatus = status;
            await this.messagesRepository.save(sentMessage);
        }

        const receivedMessages = await this.messagesRepository.find({
            where: {
                receiver: { id: user.id },
                issuer: { id: userId }
            },
            relations: [ "issuer", "receiver" ]
        });

        await this.validateConversationStatus(receivedMessages, false, status);

        for (const receivedMessage of receivedMessages) {
            receivedMessage.receiverStatus = status;
            await this.messagesRepository.save(receivedMessage);
        }

        return { message: SuccessMessageConstants.USER_CONVERSATION_STATUS_HAS_BEEN_CHANGED_SUCCESSFULLY };
    }

    private validateConversationStatus(
        messages: MedivetMessage[],
        asIssuer: boolean,
        newStatus: MedivetMessageStatus
    ): Promise<void> {
        if (messages.length === 0) return;

        const messageStatus = asIssuer ? messages[0].issuerStatus : messages[0].receiverStatus;

        if (messageStatus === MedivetMessageStatus.ACTIVE && newStatus === MedivetMessageStatus.REMOVED) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CHANGE_MESSAGE_STATUS_FROM_ACTIVE_TO_REMOVED,
                    property: "all"
                }
            ]);
        }
        if (messageStatus === MedivetMessageStatus.REMOVED) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CHANGE_MESSAGE_STATUS_FROM_REMOVED,
                    property: "all"
                }
            ]);
        }
    }

}
