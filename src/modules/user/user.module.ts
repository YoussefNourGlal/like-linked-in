import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/guard/handleTokens';
import { UserModel } from 'src/DB/models/user';

@Module({
  imports:[UserModel],
  controllers: [UserController],
  providers: [UserService,JwtService,TokenService],
})
export class UserModule {}
