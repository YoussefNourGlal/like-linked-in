import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActionEnum, AdminActionDto } from './dto/create-admin.dto';
import { Request } from 'express';
import { HUserDocument, User } from 'src/DB/models/user';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, HCompanyDocument } from 'src/DB/models/company';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly usermodel: Model<HUserDocument>,
    @InjectModel(Company.name)
    private readonly companymodel: Model<HCompanyDocument>,
  ) {}
  // rest api
  async BanOrUnbanUser(userId: string, req: Request, body: AdminActionDto) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }

    const targetUser = await this.usermodel.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    let updateQuery: any = {};

    if (body.action === ActionEnum.ban) {
      updateQuery = { bannedAt: new Date() };
    } else {
      updateQuery = { $unset: { bannedAt: 1 } };
    }

    const data = await this.usermodel.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    return {
      message: 'done',
      data,
    };
  }

  async BanOrUnbanCompany(
    companyId: string,
    req: Request,
    body: AdminActionDto,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }

    const targetCompany = await this.companymodel.findById(companyId);
    if (!targetCompany) {
      throw new NotFoundException('company not found');
    }

    let updateQuery: any = {};

    if (body.action === ActionEnum.ban) {
      updateQuery = { bannedAt: new Date() };
    } else {
      updateQuery = { $unset: { bannedAt: 1 } };
    }

    const data = await this.companymodel.findByIdAndUpdate(
      companyId,
      updateQuery,
      {
        new: true,
      },
    );

    return {
      message: 'done',
      data,
    };
  }

  async ApproveCompany(companyId: string, req: Request) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }

    const targetCompany = await this.companymodel.findById(companyId);
    if (!targetCompany) {
      throw new NotFoundException('company not found');
    }
    if (targetCompany.approvedByAdmin) {
      throw new BadRequestException('Company already approved');
    }

    const data = await this.companymodel.findByIdAndUpdate(
      companyId,
      { approvedByAdmin: true },
      {
        new: true,
      },
    );
    return {
      message: 'done',
      data,
    };
  }

  //graphql api

  async getDashboardData() {
    const users = await this.usermodel.find();
    const companies = await this.companymodel.find();

    return {
      users,
      companies,
    };
  }
}
