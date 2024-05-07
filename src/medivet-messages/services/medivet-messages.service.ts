import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Equal, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetCreateMessageDto } from "@/medivet-messages/dto/medivet-create-message.dto";
import { MedivetSearchConversationDto } from "@/medivet-messages/dto/medivet-search-conversation.dto";
import { MedivetSearchMessageDto } from "@/medivet-messages/dto/medivet-search-message.dto";
import { MedivetUpdateMessageDto } from "@/medivet-messages/dto/medivet-update-message.dto";
import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetUserConversation } from "@/medivet-messages/types/types";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetMessagesService {
    constructor(
    @InjectRepository(MedivetMessage) private messagesRepository: Repository<MedivetMessage>,
    private usersService: MedivetUsersService,
    ) {
    }

    async createMessage(
        issuer: MedivetUser,
        createMessageDto: MedivetCreateMessageDto
    ): Promise<MedivetMessage> {
        const { message, receiverId } = createMessageDto;
        const receiver = await this.usersService.findOneById(receiverId);

        this.checkIfCorrespondingUserIsAvailable(receiver);
        await this.checkIfIssuerCanSendMessageToReceiverBasedOnUserRole(issuer, receiver);

        const newMessage = this.messagesRepository.create({
            message,
            receiver,
            receiverStatus: MedivetMessageStatus.ACTIVE,
            issuer,
            issuerStatus: MedivetMessageStatus.ACTIVE,
            read: false,
        });
        await this.messagesRepository.save(newMessage);

        return newMessage;
    }

    async searchAllUserConversations(
        user: MedivetUser,
        searchDto: MedivetSearchConversationDto
    ): Promise<MedivetUserConversation[]> {
        const relations = [ "issuer", "receiver" ];
        const { status, offset, pageSize, lastUpdate } = searchDto;

        const sentMessages = await this.messagesRepository.find({
            relations,
            where: {
                issuer: { id: user.id },
                issuerStatus: Not(Equal(MedivetMessageStatus.REMOVED))
            }
        });
        const receivedMessages = await this.messagesRepository.find({
            relations,
            where: {
                receiver: { id: user.id },
                receiverStatus: Not(Equal(MedivetMessageStatus.REMOVED))
            }
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
                    lastUpdate: sentMessage.lastUpdate
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
                    lastUpdate: receivedMessage.lastUpdate
                });
            }
        });

        conversations.forEach(conversation => {
            conversation.messages.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            });

            conversation.lastUpdate = conversation.messages[0].lastUpdate;
        });

        if (lastUpdate) {
            conversations = conversations.filter(conversation =>
                moment(conversation.lastUpdate).isSameOrAfter(moment(lastUpdate)));
        }

        switch (status) {
            case MedivetMessageStatus.ARCHIVED:
                conversations = conversations.filter(message => message.status == MedivetMessageStatus.ARCHIVED);
                break;
            case MedivetMessageStatus.ACTIVE:
            default:
                conversations = conversations.filter(message => message.status == MedivetMessageStatus.ACTIVE);
                break;
        }

        conversations.sort(
            (a, b) =>
                b.messages[0].createdAt.getTime() - a.messages[0].createdAt.getTime()
        );

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
                issuer: { id: user.id },
                issuerStatus: Not(Equal(MedivetMessageStatus.REMOVED))
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
                issuer: { id: userId },
                receiverStatus: Not(Equal(MedivetMessageStatus.REMOVED))
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

    async getMessagesWithUser(
        user: MedivetUser,
        correspondingUserId: number,
        searchDto: MedivetSearchMessageDto
    ): Promise<MedivetMessage[]> {
        const { offset, pageSize, lastUpdate } = searchDto;
        const relations = [ "issuer", "receiver" ];

        const sentMessages = await this.messagesRepository.find({
            relations,
            where: {
                issuer: { id: user.id },
                receiver: { id: correspondingUserId },
                lastUpdate: lastUpdate ? MoreThanOrEqual(new Date(lastUpdate)) : LessThanOrEqual(new Date()),
                issuerStatus: Not(Equal(MedivetMessageStatus.REMOVED))
            }
        });

        const receivedMessages = await this.messagesRepository.find({
            relations,
            where: {
                receiver: { id: user.id },
                issuer: { id: correspondingUserId },
                lastUpdate: lastUpdate ? MoreThanOrEqual(new Date(lastUpdate)) : LessThanOrEqual(new Date()),
                receiverStatus: Not(Equal(MedivetMessageStatus.REMOVED))
            }
        });
        const allMessages = [ ...sentMessages, ...receivedMessages ];
        allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return paginateData(allMessages, {
            offset,
            pageSize
        });
    }

    async markConversationAsRead(
        user: MedivetUser,
        correspondingUserId: number,
    ): Promise<MedivetMessage[]> {
        const unreadMessages = await this.messagesRepository.find({
            where: {
                read: false,
                receiver: { id: user.id },
                issuer: { id: correspondingUserId },
                receiverStatus: Not(Equal(MedivetMessageStatus.REMOVED))
            },
            relations: [ "issuer", "receiver" ]
        });

        for (const unreadMessage of unreadMessages) {
            unreadMessage.read = true;
            await this.messagesRepository.save(unreadMessage);
        }

        return unreadMessages;
    }

    private async checkIfIssuerCanSendMessageToReceiverBasedOnUserRole(
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

    private checkIfCorrespondingUserIsAvailable(receiver: MedivetUser): void {
        if (receiver.role === MedivetUserRole.REMOVED) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_SEND_MESSAGE_TO_REMOVED_USER,
                    property: "all"
                }
            ]);
        }
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
