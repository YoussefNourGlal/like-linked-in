import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatusDto,
  applicationStatusMiniEnum,
  CreateJobDto,
  DeleteJobDto,
  getJobDto,
  getJobWithFilterDto,
} from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HJobDocument, Job } from 'src/DB/models/job';
import { Model } from 'mongoose';
import { Company, HCompanyDocument } from 'src/DB/models/company';
import { Types } from 'mongoose';
import { Request } from 'express';
import { Application, HApplicationDocument } from 'src/DB/models/application';
import { HUserDocument } from 'src/DB/models/user';
import { Emailevent } from 'src/common/utiles/events/email';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private readonly jopmodel: Model<HJobDocument>,
    @InjectModel(Company.name)
    private readonly companymodel: Model<HCompanyDocument>,
    @InjectModel(Application.name)
    private readonly applicationmodel: Model<HApplicationDocument>,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const company = await this.companymodel.findOne({
      _id: new Types.ObjectId(createJobDto.companyId),
      approvedByAdmin: true,
    });

    if (!company) {
      throw new BadRequestException('company not exist');
    }
    if (
      !company.createdBy.equals(createJobDto.addedBy) &&
      !company.HRs.some((hr) => hr.equals(createJobDto.addedBy))
    ) {
      throw new BadRequestException('you cant add job');
    }

    const job = await this.jopmodel.create(createJobDto);

    return {
      message: 'done',
      job,
    };
  }

  async update(updateJobDto: UpdateJobDto, req: Request, id: string) {
    // only  createdBy can update it and is unique
    const company = await this.companymodel
      .findOne({
        createdBy: req.user?._id,
        approvedByAdmin: true,
      })
      .populate('jobs');

    if (!company) {
      throw new BadRequestException(
        'company not exist or you cant update this job',
      );
    }
    if (company.jobs.length == 0)
      throw new BadRequestException('company has not any jobs');

    const job = await this.jopmodel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        companyId: company._id,
      },
      {
        ...updateJobDto,
      },
      {
        new: true,
      },
    );

    if (!job) {
      throw new BadRequestException('job not found');
    }

    return {
      message: 'done',
      job,
    };
  }

  async delete(deleteJobDto: DeleteJobDto, req: Request) {
    let job = await this.jopmodel
      .findById(deleteJobDto.jobId)
      .populate('companyId');
    if (!job) {
      throw new BadRequestException('the job not found');
    }
    let company = job.companyId as unknown as HCompanyDocument;

    if (!company.HRs.some((hr) => hr.equals(req.user?._id))) {
      throw new BadRequestException('you cant delete this job');
    }
    await this.jopmodel.findByIdAndDelete(job._id);

    return {
      message: 'done',
    };
  }

  async getJobs(
    companyName: string,
    jobId: string | undefined,
    getJobDto: getJobDto,
  ) {
    let company = await this.companymodel.findOne({ companyName });
    if (!company) {
      throw new BadRequestException('the company not found');
    }

    if (jobId) {
      let job = await this.jopmodel.findOne({
        _id: new Types.ObjectId(jobId),
        companyId: company._id,
      });
      if (!job) throw new BadRequestException('the job not found');
      return {
        message: 'done',
        job,
      };
    }

    let skip = (getJobDto.page! - 1) * getJobDto.limit!;
    let jobs = await this.jopmodel
      .find({ companyId: company._id })
      .skip(skip)
      .limit(getJobDto.limit!);
    if (!jobs.length) {
      return {
        message: 'no data',
        jobs: [],
      };
    }
    return {
      message: 'done',
      jobs,
      page: getJobDto.page,
      limit: getJobDto.limit,
    };
  }

  async getJobsWithFilter(filter: getJobWithFilterDto, getJobDto: getJobDto) {
    let skip = (getJobDto.page! - 1) * getJobDto.limit!;
    if (!(Object.keys(filter).length > 0)) {
      let jobs = await this.jopmodel.find().skip(skip).limit(getJobDto.limit!);
      return {
        message: 'done',
        jobs,
        page: getJobDto.page,
        limit: getJobDto.limit,
      };
    }

    const query: any = {};

if (filter.jobTitle) {
  query.jobTitle = { $regex: filter.jobTitle, $options: 'i' };
}

if (filter.jobLocation) {
  query.jobLocation = filter.jobLocation;
}

if (filter.workingTime) {
  query.workingTime = filter.workingTime;
}

if (filter.seniorityLevel) {
  query.seniorityLevel = filter.seniorityLevel;
}

if (filter.technicalSkills?.length) {
  query.technicalSkills = { $all: filter.technicalSkills };
}
    
    let jobs = await this.jopmodel
      .find(query)
      .skip(skip)
      .limit(getJobDto.limit!);
    if (!jobs.length) {
      return {
        message: 'no jobs with this filter',
        jobs: [],
      };
    }
    return {
      message: 'done',
      jobs,
      page: getJobDto.page,
      limit: getJobDto.limit,
    };
  }

  async getApplication(jobId: string, req: Request, getJobDto: getJobDto) {
    let job = await this.jopmodel
      .findById(jobId)
      .populate(['application', 'companyId']);
    if (!job) throw new BadRequestException('the job not found');

    let company = job.companyId as unknown as HCompanyDocument;
    let applications = job.application as unknown as HApplicationDocument[];
    let appId = applications.map(function (app) {
      return app._id;
    });

    if (
      !company.HRs.some((hr) => hr.equals(req.user?._id)) &&
      !company.createdBy.equals(req.user?._id)
    ) {
      throw new BadRequestException('you cant see any Application');
    }
    let skip = (getJobDto.page! - 1) * getJobDto.limit!;
    let data = await this.applicationmodel
      .find({ _id: appId })
      .populate('userId')
      .skip(skip)
      .limit(getJobDto.limit!);
    if (!data.length) {
      throw new BadRequestException('not application found');
    }
    return {
      message: 'done',
      data,
      page: getJobDto.page,
      limit: getJobDto.limit,
    };
  }

  async ApplicationStatus(
    body: ApplicationStatusDto,
    req: Request,
    appId: string,
  ) {
    const application = await this.applicationmodel
      .findById(appId)
      .populate(['jobId', 'userId']);

    if (!application)
      throw new NotFoundException('sorry not found this application');
    let user = application?.userId as unknown as HUserDocument;
    let job = application.jobId as unknown as HJobDocument;
    let company = await this.companymodel.findById(job.companyId);

    if (!company?.HRs.some((hr) => hr.equals(req.user?._id))) {
      throw new ForbiddenException(
        'You are not allowed to edit this application',
      );
    }
    let app = await this.applicationmodel.findByIdAndUpdate(
      appId,
    { status: body.status },
    { new: true }
    );
    await Emailevent.emit('ApplicationStatus', {
      userName: user.username,
      to: user.email,
      status: body.status,
    });

    return {
      message: 'done',
      app,
    };
  }
}
