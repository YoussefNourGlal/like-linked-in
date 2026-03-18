import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadGatewayException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HUserDocument, User } from 'src/DB/models/user';
import { signatureEnum, TokenService, typeTokenEnum } from './handleTokens';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const TOKEN_TYPE = 'tokenType';

export const TokenType = (type: 'access' | 'refresh') =>
  SetMetadata(TOKEN_TYPE, type);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly usermodel: Model<HUserDocument>,
    private jwtService: JwtService,
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new BadGatewayException('the token is Missing');
    }
    let [bearer, token] = authHeader.split(' ');
    if (!bearer || !token) {
      throw new BadRequestException('the token is not correct');
    }
    if (bearer != 'user' && bearer != 'admin') {
      throw new BadRequestException('the token is not correctt');
    }
    let signature = await this.tokenService.getSignature(
      bearer as signatureEnum,
    );
    let decoded;

    const typeToken = this.reflector.get<string>(
      TOKEN_TYPE,
      context.getHandler(),
    );

    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret:
          typeToken == typeTokenEnum.access
            ? signature.accessKey
            : signature.refreshKey,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    let user = await this.usermodel.findById(decoded.id);
    if (!user) {
      throw new BadGatewayException('the user not found');
    }
    request.user = user;
    return true;
  }
}
