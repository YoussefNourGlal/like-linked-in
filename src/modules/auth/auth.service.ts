import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateAuthDto,
  IConfirmEmailDto,
  IforgetPasswordDto,
  ILoginDto,
  IresetePasswordDto,
  IRsendOtpDto,
} from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HUserDocument, User } from 'src/DB/models/user';
import { HOtpDocument, Otp } from 'src/DB/models/otp';
import { Model, Types } from 'mongoose';
import { otpEnum, ProviderEnum } from 'src/DB/enums/user.enums';
import { customAlphabet } from 'nanoid';
import { compare } from 'src/common/utiles/hashing/hash';
import { TokenService } from 'src/common/guard/handleTokens';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usermodel: Model<HUserDocument>,
    @InjectModel(Otp.name) private readonly otpmodel: Model<HOtpDocument>,
    private readonly tokenService: TokenService,
  ) {}

  // function create otp
  async createotp(userId: Types.ObjectId, otp: string, type: otpEnum) {
    await this.otpmodel.create({
      createdBy: userId,
      code: otp,
      expiredAt: new Date(Date.now() + 3 * 60 * 1000), // 3 Min
      type,
    });
  }

  //rest api

  async signup(body: CreateAuthDto) {
    let {
      username,
      email,
      password,
      provider,
      gender,
      DOB,
      mobileNumber,
      role,
    } = body;
    let checkUser = await this.usermodel.findOne({ email });
    if (checkUser) throw new BadRequestException('the user is Already exist');
    let otp = customAlphabet('123456789', 6)();
    let user = await this.usermodel.create({
      username,
      email,
      password,
      provider,
      gender,
      DOB,
      mobileNumber,
      role,
    });
    if (!user) {
      throw new BadRequestException('user cant created  sorry');
    }
    await this.createotp(user._id, otp, otpEnum.EMAIL_VERFICATION);
    return { message: 'user created successfuly', user };
  }

  async resendOtp(body: IRsendOtpDto) {
    let { email } = body;
    let checkUser = await this.usermodel
      .findOne({ email, confirmEmail: { $exists: false } })
      .populate({ path: 'otp', match: { type: otpEnum.EMAIL_VERFICATION } });
    if (!checkUser) throw new BadRequestException('the user is NOT exist');
    if (checkUser.otp.length) throw new BadRequestException('the otp is exist');

    let otp = customAlphabet('123456789', 6)();

    await this.createotp(checkUser._id, otp, otpEnum.EMAIL_VERFICATION);
    return { message: 'check your email' };
  }

  async confirmEmail(body: IConfirmEmailDto) {
    let { email, otp } = body;
    let checkUser = await this.usermodel
      .findOne({ email, confirmEmail: { $exists: false } })
      .populate({ path: 'otp', match: { type: otpEnum.EMAIL_VERFICATION } });
    if (!checkUser) throw new BadRequestException('the user is NOT exist');
    if (!checkUser.otp.length)
      throw new BadRequestException('the otp not exist');
    if (!(await compare(otp, checkUser.otp[0].code)))
      throw new BadRequestException('the otp not correct');

    await this.usermodel.updateOne(
      { email, _id: checkUser._id },
      { $set: { confirmEmail: new Date() }, $inc: { __v: 1 } },
    );

    return { message: 'User Confirmed Successfully' };
  }

  async login(body: ILoginDto) {
    let { email, password } = body;
    let checkUser = await this.usermodel.findOne({
      email,
      confirmEmail: { $exists: true },
    });
    if (!checkUser) throw new BadRequestException('the user Not exist');
    if (!(await compare(password, checkUser.password)))
      throw new BadRequestException('the password not correct');

    let tokens =await this.tokenService.getToken(checkUser);
    console.log(tokens);
    

    return {
      tokens,
      message: 'user is  logged successfuly',
    };
  }

  async refreshToken(req: Request) {
    let tokens = await this.tokenService.getToken(req.user as HUserDocument);
    return {
      message: 'the tokens updated successfully',
      token: tokens.tokenAccess,
    };
  }

  async forgetPassword(body: IforgetPasswordDto) {
    let checkUser = await this.usermodel.findOne({
      email: body.email,
      confirmEmail: { $exists: true },
    });
    if (!checkUser) throw new BadRequestException('the user is not exist');

    let otp = customAlphabet('123456789', 6)();
    await this.createotp(checkUser._id, otp, otpEnum.PASSWORD_RESET);
    return { message: 'check your email' };
  }

  async resetePassword(body: IresetePasswordDto) {
    let checkUser = await this.usermodel
      .findOne({
        email: body.email,
        confirmEmail: { $exists: true },
      })
      .populate({ path: 'otp', match: { type: otpEnum.PASSWORD_RESET } });
    if (!checkUser) throw new BadRequestException('the user is not exist');

    if (!checkUser.otp.length)
      throw new BadRequestException('the otp not exist');
    if (!(await compare(body.otp, checkUser.otp[0].code)))
      throw new BadRequestException('the otp not correct');

    checkUser.password = body.password;
    await checkUser.save();

    return {
      message: 'the password updated successfully',
    };
  }
}
