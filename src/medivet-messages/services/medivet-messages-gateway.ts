import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { plainToClass } from "class-transformer";
import { Server, Socket } from "socket.io";

import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@WebSocketGateway(process.env.WEB_SOCKET_PORT ? Number(process.env.WEB_SOCKET_PORT) : 3006)
export class MedivetMessagesGateway {
  @WebSocketServer() server: Server;

  constructor(
    private messagesService: MedivetMessagesService,
    private usersService: MedivetUsersService
  ) {
  }

  @SubscribeMessage("sendMessage")
  async handleListenMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: {
      receiverId: number;
      message: string;
    },
  ): Promise<{ data: MedivetMessage }> {
      const issuer = plainToClass(MedivetUser, await this.messagesService.getUserFromSocket(socket));
      const createdMessage = await this.messagesService.createMessage(issuer, {
          message: body.message,
          receiverId: body.receiverId
      });

      this.server.emit("receiveMessage", {
          message: "New message",
          data: createdMessage
      });

      return { data: createdMessage };
  };

  @SubscribeMessage("markAsRead")
  async handleReadMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: {
      receiverId: number;
    }
  ): Promise<{ data: MedivetMessage[] }> {
      const issuer = await this.messagesService.getUserFromSocket(socket);
      const messages = await this.messagesService.markConversationAsRead(issuer, body.receiverId);

      this.server.emit("receiveReadMessages", { data: messages });

      return { data: messages };
  }
}
