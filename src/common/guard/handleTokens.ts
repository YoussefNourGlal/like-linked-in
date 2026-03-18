import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HUserDocument } from 'src/DB/models/user';
import { v4 as uuid } from 'uuid';

export enum signatureEnum {
  admin = 'admin',
  user = 'user',
  owner="owner",
  HR="HR"
}
export enum typeTokenEnum {
  access = 'access',
  refresh = 'refresh',
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async getToken(user: HUserDocument) {
    const keys = await this.getSignature(user.role);

    const tokenAccess = await this.jwtService.signAsync(
      { id: user._id, email: user.email },
      { secret: keys.accessKey, jwtid: uuid(), expiresIn: '1h' },
    );

    const tokenRefresh = await this.jwtService.signAsync(
      { id: user._id, email: user.email },
      { secret: keys.refreshKey, jwtid: uuid(), expiresIn: '1d' },
    );

    return { tokenAccess, tokenRefresh };
  }

  async getSignature(signaturLevel: signatureEnum = signatureEnum.user) {
    let signature: { refreshKey: string; accessKey: string } = {
      refreshKey: '',
      accessKey: '',
    };
    switch (signaturLevel) {
      case signatureEnum.user:
        signature.refreshKey = process.env.KEYTOKEN_REFRESH_USER as string;
        signature.accessKey = process.env.KEYTOKEN_ACCESS_USER as string;
        break;

      default:
        signature.refreshKey = process.env.KEYTOKEN_REFRESH_ADMIN as string;
        signature.accessKey = process.env.KEYTOKEN_ACCESS_ADMIN as string;
        break;
    }
    return signature;
  }
}
