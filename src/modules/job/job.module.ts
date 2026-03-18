import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { UserModel } from 'src/DB/models/user';
import { CompanyModel } from 'src/DB/models/company';
import { JobModel } from 'src/DB/models/job';
import { TokenService } from 'src/common/guard/handleTokens';
import { JwtService } from '@nestjs/jwt';
import { ApplicationModel } from 'src/DB/models/application';

@Module({
  
  imports:[UserModel,CompanyModel,JobModel,ApplicationModel],
  controllers: [JobController],
  providers: [JobService,TokenService,JwtService],
})
export class JobModule {}
