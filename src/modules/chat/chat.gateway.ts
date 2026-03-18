import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { InjectModel } from '@nestjs/mongoose';
import { HUserDocument, User } from 'src/DB/models/user';
import { Model, Types } from 'mongoose';
import { signatureEnum } from 'src/common/guard/handleTokens';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    @InjectModel(User.name)
    private readonly usermodel: Model<HUserDocument>,
  ) {}

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;

    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.join(userId); // كل user له room
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const { receiverId, message } = data;

    
    const senderId = socket.handshake.query.userId as string;

    if (!message) {
      throw new WsException('Message is required');
    }

    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = new Types.ObjectId(receiverId);

    //  check existing chat
    const existingChat = await this.chatService.findChat(
      senderId,
      receiverId,
    );

    
    if (!existingChat) {
      const sender = await this.usermodel.findById(senderObjectId);
      if (!sender) throw new WsException('Sender not found');

      if (sender.role !== signatureEnum.HR && sender.role !== signatureEnum.owner) {
        throw new WsException('Only HR or owner can start chat');
      }
    }

    //  save message
    await this.chatService.saveMessage(senderId, receiverId, message);

    //  للـ receiver
    socket.to(receiverId).emit('receiveMessage', {
      senderId,
      message,
    });

    //  للـ sender نفسه
    socket.emit('receiveMessage', {
      senderId,
      message,
    });

    return { success: true };
  }
}