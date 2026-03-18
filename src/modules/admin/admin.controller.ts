import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminActionDto } from './dto/create-admin.dto';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { typeTokenEnum } from 'src/common/guard/handleTokens';
import { type Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('user/:userId')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  BanOrUnbanUser(
    @Param('userId') userId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AdminActionDto,
    @Req() req: Request,
  ) {
    return this.adminService.BanOrUnbanUser(userId, req, body);
  }

  @Patch('company/:companyId')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  BanOrUnbanCompany(
    @Param('companyId') companyId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AdminActionDto,
    @Req() req: Request,
  ) {
    return this.adminService.BanOrUnbanCompany(companyId, req, body);
  }

  @Patch('ApproveCompany/:companyId')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  ApproveCompany(@Param('companyId') companyId: string, @Req() req: Request) {
    return this.adminService.ApproveCompany(companyId, req);
  }
}
