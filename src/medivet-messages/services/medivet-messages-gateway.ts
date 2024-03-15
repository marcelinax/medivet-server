import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { MedivetMessage } from "@/medivet-messages/entities/medivet-message.entity";
import { MedivetMessagesService } from "@/medivet-messages/services/medivet-messages.service";

@WebSocketGateway(process.env.WEB_SOCKET_PORT ? Number(process.env.WEB_SOCKET_PORT) : 3006)
export class MedivetMessagesGateway {
  @WebSocketServer() server: Server;

  constructor(
    private messagesService: MedivetMessagesService
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
      const issuer = await this.messagesService.getUserFromSocket(socket);
      const createdMessage = await this.messagesService.createMessage(issuer, {
          message: body.message,
          receiverId: body.receiverId
      });

      return { data: createdMessage };
  };
}
