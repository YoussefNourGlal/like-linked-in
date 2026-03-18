import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { UserModel } from 'src/DB/models/user';
import { CompanyModel } from 'src/DB/models/company';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/guard/handleTokens';

@Module({
   imports:[UserModel,CompanyModel],
  controllers: [CompanyController],
  providers: [CompanyService,JwtService,TokenService],
})
export class CompanyModule {}
