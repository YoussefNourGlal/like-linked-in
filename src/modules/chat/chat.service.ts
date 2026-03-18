import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, HChatDocument } from 'src/DB/models/chat';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<HChatDocument>,
  ) {}

  
//rest api
  async getChatHistory(currentUserId: Types.ObjectId, otherUserId: string) {
    const otherId = new Types.ObjectId(otherUserId);

    const chat = await this.chatModel
      .findOne({
        $or: [
          { senderId: currentUserId, receiverId: otherId },
          { senderId: otherId, receiverId: currentUserId },
        ],
      })
      .populate('messages.senderId', 'username email');

    if (!chat) {
      return { messages: [] };
    }

    return {
      messages: chat.messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      ),
    };
  }



//io
  async findChat(senderId: string, receiverId: string) {
    const sId = new Types.ObjectId(senderId);
    const rId = new Types.ObjectId(receiverId);

    return this.chatModel.findOne({
      $or: [
        { senderId: sId, receiverId: rId },
        { senderId: rId, receiverId: sId },
      ],
    });
  }

  async saveMessage(sender: string, receiver: string, message: string) {
    const senderId = new Types.ObjectId(sender);
    const receiverId = new Types.ObjectId(receiver);

    let chat = await this.chatModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (!chat) {
      chat = await this.chatModel.create({
        senderId,
        receiverId,
        messages: [],
      });
    }

    chat.messages.push({
      message,
      senderId,
      createdAt: new Date(),
    });

    await chat.save();

    return chat;
  }
}
