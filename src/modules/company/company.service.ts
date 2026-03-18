import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, HCompanyDocument } from 'src/DB/models/company';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { signatureEnum } from 'src/common/guard/handleTokens';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private readonly companymodel: Model<HCompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    let company = await this.companymodel.findOne({
      $or: [
        { companyEmail: createCompanyDto.companyEmail },
        { companyName: createCompanyDto.companyName },
        {createdBy:createCompanyDto.createdBy}
      ],
    });

    if (company) {
      throw new BadRequestException('company name or email already exist or you can create one company only');
    }

    company = await this.companymodel.create(createCompanyDto);
    if (!company) {
      throw new BadRequestException('faild sorry!');
    }

    return {
      message: 'done',
      company,
    };
  }

  async update(updateCompanyDto: UpdateCompanyDto, req: Request) {
    let company = await this.companymodel.findOneAndUpdate(
      { createdBy: req.user?._id },
      updateCompanyDto,
      { new: true },
    );

    if (!company) {
      throw new BadRequestException('company not exist');
    }
    return {
      message: 'done',
      company,
    };
  }

  async soft_delete(req: Request, id: string) {
    if (req.user?.role == signatureEnum.user) {
      // createdby is unique in database  only owner can perform this
      let company = await this.companymodel.findOneAndUpdate(
        { createdBy: req.user?._id, _id: new Types.ObjectId(id) },
        { $set: { deletedAt: new Date() } },
        { new: true },
      );

      if (!company) {
        throw new BadRequestException('company not exist');
      }
      return {
        message: 'done',
        company,
      };
    }if(req.user?.role==signatureEnum.admin) {
      let company = await this.companymodel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        { $set: { deletedAt: new Date() } },
        { new: true },
      );

      if (!company) {
        throw new BadRequestException('company not exist');
      }
      return {
        message: 'done',
        company,
      };
    }
  }

  async searchByName(companyName: string) {
    let company = await this.companymodel.findOne({ companyName });

    if (!company) {
      throw new BadRequestException('company not exist');
    }
    return {
      message: 'done',
      company,
    };
  }

  async uploadlogo(logo: string, req: Request) {
    let company = await this.companymodel.findOneAndUpdate(
      { createdBy: req.user?._id },
      { $set: { logo } },
      { new: true },
    );
    if (!company) {
      throw new BadRequestException('the company is not exist');
    }
    return {
      message: 'done',
      company,
    };
  }
  async uploadcover(cover: string, req: Request) {
    let company = await this.companymodel.findOneAndUpdate(
      { createdBy: req.user?._id },
      { $set: { coverPic: cover } },
      { new: true },
    );
    if (!company) {
      throw new BadRequestException('the company is not exist');
    }
    return {
      message: 'done',
      company,
    };
  }

  async deletelogo(req: Request) {
    let company = await this.companymodel.findOne({ createdBy: req.user?._id });

    if (!company) {
      throw new BadRequestException('company not found');
    }

    if (!company.logo) {
      throw new BadRequestException('no logo picture found');
    }

    const imagePath = path.join(process.cwd(), 'src/uploads', company.logo);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await this.companymodel.updateOne(
      { _id: company._id },
      { $unset: { logo: 1 } },
    );

    return {
      message: 'logo picture deleted successfully',
    };
  }

  async deletecover(req: Request) {
    let company = await this.companymodel.findOne({ createdBy: req.user?._id });

    if (!company) {
      throw new BadRequestException('company not found');
    }

    if (!company.coverPic) {
      throw new BadRequestException('no coverPic picture found');
    }

    const imagePath = path.join(process.cwd(), 'src/uploads', company.coverPic);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await this.companymodel.updateOne(
      { _id: company._id },
      { $unset: { coverPic: 1 } },
    );

    return {
      message: 'coverPic picture deleted successfully',
    };
  }

 async getCompany(companyId: string) {
    let company = await this.companymodel.findOne({ _id:new Types.ObjectId(companyId) }).populate("jobs");

    if (!company) {
      throw new NotFoundException('company not found');
    }
    return {
      message: 'done',
      company,
    };
  }


}
