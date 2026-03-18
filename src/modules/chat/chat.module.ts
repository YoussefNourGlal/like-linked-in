import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { UserModel } from 'src/DB/models/user';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/guard/handleTokens';
import { chatModel } from 'src/DB/models/chat';

@Module({
  imports:[UserModel,chatModel],
  providers: [ChatService, ChatGateway,JwtService,TokenService],
  controllers: [ChatController]
})
export class ChatModule {}
