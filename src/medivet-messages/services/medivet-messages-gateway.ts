import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { plainToClass } from "class-transformer";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@WebSocketGateway(process.env.WEB_SOCKET_PORT ? Number(process.env.WEB_SOCKET_PORT) : 3006)
export class MedivetMessagesGateway {
  @WebSocketServer() server: Server;
  clients: Map<number, Socket> = new Map();

  constructor(
    private messagesService: MedivetMessagesService,
  ) {
  }

  async handleConnection(client: Socket): Promise<void> {
      const clientId = plainToClass(MedivetUser, await this.messagesService.getUserFromSocket(client)).id;
      this.clients.set(clientId, client);

  }

  async handleDisconnect(client: Socket): Promise<void> {
      const clientId = plainToClass(MedivetUser, await this.messagesService.getUserFromSocket(client)).id;

      this.clients.forEach((value, key) => {
          if (key === clientId) {
              this.clients.delete(key);
          }
      });
  }

  getClient(clientId: number): Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
      return this.clients.get(clientId);
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
      const issuerSocket = this.getClient(issuer.id);
      const receiverSocket = this.getClient(body.receiverId);
      const createdMessage = await this.messagesService.createMessage(issuer, {
          message: body.message,
          receiverId: body.receiverId
      });
      if (issuerSocket) {
          issuerSocket.emit("receiveMessage", {
              message: "New message",
              data: createdMessage
          });
      }
      if (receiverSocket) {
          receiverSocket.emit("receiveMessage", {
              message: "New message",
              data: createdMessage
          });
      }

      return { data: createdMessage };
  };

  @SubscribeMessage("markAsRead")
  async handleReadMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: {
      receiverId: number;
    }
  ): Promise<{ data: MedivetMessage[] }> {
      const issuer = plainToClass(MedivetUser, await this.messagesService.getUserFromSocket(socket));
      const receiverSocket = this.getClient(body.receiverId);
      const issuerSocket = this.getClient(issuer.id);
      const messages = await this.messagesService.markConversationAsRead(issuer, body.receiverId);

      if (issuerSocket) {
          issuerSocket.emit("receiveReadMessages", { data: messages });
      }
      if (receiverSocket) {
          receiverSocket.emit("receiveReadMessages", { data: messages });
      }
      return { data: messages };
  }
}
