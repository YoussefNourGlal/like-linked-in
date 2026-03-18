import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, otpEnum, ProviderEnum } from '../enums/user.enums';
import { hashing } from 'src/common/utiles/hashing/hash';
import { User } from './user';
import { Emailevent } from 'src/common/utiles/events/email';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Otp {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  code: string;
  //
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  createdBy: Types.ObjectId;
  //
  @Prop({
    type: Date,
    required: true,
  })
  expiredAt: Date;
  //
  @Prop({
    type: String,
    enum: {
      values: Object.values(otpEnum),
    },
    required: true,
  })
  type: string;
}
export const otpSchema = SchemaFactory.createForClass(Otp);
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
export type HOtpDocument = HydratedDocument<Otp>;
export const OtpModel = MongooseModule.forFeature([
  {
    name: Otp.name,
    schema: otpSchema,
  },
]);

otpSchema.pre(
  'save',
  async function (
    this: HOtpDocument & { wasnew?: boolean; codePlane?: string },
    next,
  ) {
    this.wasnew = this.isNew;
    if (this.isModified('code')) {
      this.codePlane = this.code;
      this.code = await hashing(this.code);
    }
    await this.populate('createdBy');
  },
);

otpSchema.post('save', async function (doc, next) {
  let that = this as HOtpDocument & {
    wasnew?: boolean;
    codePlane?: string;
  };
  if (that.wasnew && that.codePlane) {
    if(this.type==otpEnum.EMAIL_VERFICATION){
    await Emailevent.emit('confirmEmail', {
      otp: that.codePlane,
      username: (this.createdBy as any).username,
      to: (this.createdBy as any).email,
      
    });
  }
  else{
     await Emailevent.emit('forgetPassword', {
      otp: that.codePlane,
      username: (this.createdBy as any).username,
      to: (this.createdBy as any).email,
    });
  }
  }
});
