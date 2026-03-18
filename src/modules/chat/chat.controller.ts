import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { type Request } from 'express';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { ChatService } from './chat.service';
import { typeTokenEnum } from 'src/common/guard/handleTokens';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  getChat(@Param('userId') userId: string, @Req() req: Request) {
    return this.chatService.getChatHistory(req.user?._id!, userId);
  }



}
