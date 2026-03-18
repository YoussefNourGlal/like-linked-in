import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  IConfirmEmailDto,
  IforgetPasswordDto,
  ILoginDto,
  IresetePasswordDto,
  IRsendOtpDto,
} from './dto/create-auth.dto';
import { type Request } from 'express';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { typeTokenEnum } from 'src/common/guard/handleTokens';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: CreateAuthDto,
  ) {
    return this.authService.signup(body);
  }

  @Post('/resendOtp')
  resendOtp(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: IRsendOtpDto,
  ) {
    return this.authService.resendOtp(body);
  }

  @Post('/confirmEmail')
  confirmEmail(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: IConfirmEmailDto,
  ) {
    return this.authService.confirmEmail(body);
  }
  @Post('/login')
  login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: ILoginDto,
  ) {
    return this.authService.login(body);
  }

  @Get('/refreshToken')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.refresh)
  refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }

  @Post('/forgetPassword')
  forgetPassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: IforgetPasswordDto,
  ) {
    return this.authService.forgetPassword(body);
  }

  @Post('/resetePassword')
  resetePassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: IresetePasswordDto,
  ) {
    return this.authService.resetePassword(body);
  }
}
