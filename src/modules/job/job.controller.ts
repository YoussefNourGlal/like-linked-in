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
  BadRequestException,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { ApplicationStatusDto, CreateJobDto, DeleteJobDto, getJobDto, getJobWithFilterDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { typeTokenEnum } from 'src/common/guard/handleTokens';
import { type Request } from 'express';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createJobDto: CreateJobDto,
    @Req() req: Request,
  ) {
    createJobDto.addedBy = req.user?._id;
    return this.jobService.create(createJobDto);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  update(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateJobDto: UpdateJobDto,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    if (!UpdateJobDto) {
      throw new BadRequestException('no data for update ');
    }
    return this.jobService.update(UpdateJobDto, req, id);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  delete(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    DeleteJobDto: DeleteJobDto,
    @Req() req: Request,
  ) {
    return this.jobService.delete(DeleteJobDto, req);
  }

@Get('/:companyName')
@UseGuards(AuthGuard)
@TokenType(typeTokenEnum.access)
getJobs(
   @Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) getJobDto: getJobDto,
  @Param('companyName') companyName: string,
  @Query('jobId') jobId?: string,
) {
  return this.jobService.getJobs(companyName, jobId,getJobDto);
}


@Post('get_Jobs')
@UseGuards(AuthGuard)
@TokenType(typeTokenEnum.access)
getJobsWithFilter(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) filter:getJobWithFilterDto,
  @Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) getJobDto: getJobDto
) {
  return this.jobService.getJobsWithFilter(filter,getJobDto);
}


@Get('application/:jobId')
@UseGuards(AuthGuard)
@TokenType(typeTokenEnum.access)
getApplication(
   @Param('jobId') jobId: string,
   @Query(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) getJobDto: getJobDto,
   @Req() req: Request,
) {
  return this.jobService.getApplication(jobId,req,getJobDto);
}


@Patch('applications/:appId/status')
@UseGuards(AuthGuard)
@TokenType(typeTokenEnum.access)
ApplicationStatus(
   @Param('appId') appId: string,
   @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: ApplicationStatusDto,
   @Req() req: Request,
) {
  return this.jobService.ApplicationStatus(body,req,appId);
}




}
