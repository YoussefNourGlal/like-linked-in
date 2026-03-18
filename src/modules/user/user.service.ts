import { BadRequestException, Injectable } from '@nestjs/common';
import { updatePasswordDto, updateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HUserDocument, User } from 'src/DB/models/user';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly usermodel: Model<HUserDocument>,
  ) {}

  async updateAccount(body: updateUserDto, req: Request) {
    let user = await this.usermodel.updateOne(
      { _id: req.user?._id, confirmEmail: { $exists: true } },
      { $set: body },
    );
    if (!user) throw new BadRequestException('the user is not exist');

    return {
      message: 'account updated successfully',
      user,
    };
  }

  async getProfileLogin(req: Request) {
    let user = await this.usermodel.findOne({ _id: req.user?._id });
    if (!user) throw new BadRequestException('the user is not exist');

    return {
      message: 'success',
      data: user,
    };
  }

  async getProfile(id: string) {
    let user = await this.usermodel.findOne({
      _id: new Types.ObjectId(id),
      confirmEmail: { $exists: true },
    });
    if (!user) throw new BadRequestException('the user is not exist');

    return {
      message: 'success',
      data: {
        username: user?.username,
        mobile: user?.mobileNumber,
        profilePic: user.profilePic,
        couverPic: user.coverPic,
      },
    };
  }

  async updatePassword(body: updatePasswordDto, req: Request) {
    let user = await this.usermodel.updateOne(
      { _id: req.user?._id, confirmEmail: { $exists: true } },
      { $set: body },
    );
    if (!user) throw new BadRequestException('the user is not exist');

    return {
      message: 'password updated successfully',
      user,
    };
  }

  async uploadProfilePic(profilePic: string, req: Request) {
    let user = await this.usermodel.findOneAndUpdate(
      { _id: req.user?._id, confirmEmail: { $exists: true } },
      { $set: { profilePic } },
      { new: true },
    );
    if (!user) {
      throw new BadRequestException('the user is not exist');
    }
    return {
      message: 'done',
      user,
    };
  }

  async uploadCoverPic(coverPic: string[], req: Request) {
    let user = await this.usermodel.findOneAndUpdate(
      { _id: req.user?._id, confirmEmail: { $exists: true } },
      { $set: { coverPic } },
      { new: true },
    );
    if (!user) {
      throw new BadRequestException('the user is not exist');
    }
    return {
      message: 'done',
      user,
    };
  }

  async deleteProfilePic(req: Request) {
    let user = await this.usermodel.findById(req.user?._id);

    if (!user) {
      throw new BadRequestException('user not found');
    }

    if (!user.profilePic) {
      throw new BadRequestException('no profile picture found');
    }

    const imagePath = path.join(process.cwd(), 'src/uploads', user.profilePic);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await this.usermodel.updateOne(
      { _id: user._id },
      { $unset: { profilePic: 1 } },
    );

    return {
      message: 'profile picture deleted successfully',
    };
  }

  async deleteCoverPic(coverPic: string, req: Request) {
    let user = await this.usermodel.findById(req.user?._id);

    if (!user) {
      throw new BadRequestException('user not found');
    }

    if (!user.coverPic?.length) {
      throw new BadRequestException('no cover images found');
    }

    if (!user.coverPic.includes(coverPic)) {
      throw new BadRequestException('image not found');
    }

    const imagePath = path.join(process.cwd(), 'src/uploads', coverPic);

    try {
      await fs.promises.unlink(imagePath);
    } catch {}

    await this.usermodel.updateOne({ _id: user._id }, { $pull: { coverPic } });

    return {
      message: 'cover image deleted successfully',
    };
  }

  async softDelete(req: Request) {
    let user = await this.usermodel.findOneAndUpdate(
      {
        _id: req.user?._id,
        confirmEmail: { $exists: true },
      },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    if (!user) {
      throw new BadRequestException('user not found');
    }
    return {
      message: 'done',
      user,
    };
  }
}
