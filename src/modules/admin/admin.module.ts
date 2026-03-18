import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/guard/handleTokens';
import { CompanyModel } from 'src/DB/models/company';
import { UserModel } from 'src/DB/models/user';
import { AdminResolver } from './admin.resolver';


@Module({
imports:[UserModel,CompanyModel],
  controllers: [AdminController],
  providers: [AdminService,JwtService,TokenService,AdminResolver],
})
export class AdminModule {}
 