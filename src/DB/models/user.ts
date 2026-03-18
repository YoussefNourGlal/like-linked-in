import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import mongoose, { CallbackWithoutResultAndOptionalError, HydratedDocument, Types } from 'mongoose';
import { GenderEnum, ProviderEnum } from '../enums/user.enums';
import { hashing } from 'src/common/utiles/hashing/hash';
import { HOtpDocument } from './otp';
import { signatureEnum } from 'src/common/guard/handleTokens';
import { decryption, encryption } from 'src/common/utiles/encryption/encryption';
import { NextFunction } from 'express';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    trim: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: function () {
      return this.provider !== ProviderEnum.GOOGLE;
    },
  })
  password: string;
  @Prop({
    type: Date,
  })
  confirmEmail: Date;
  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      message: 'MALE OR FEMALE ONLY',
      default: GenderEnum.MALE,
    },
  })
  gender: string;
  @Prop({
    type: String,
    enum: {
      values: Object.values(ProviderEnum),
      message: 'system OR google ONLY',
      default: ProviderEnum.SYSTEM,
    },
  })
  provider: string;
  @Virtual()
  otp: HOtpDocument[];

  @Prop({
    type: Date,
    required: true,
  })
  DOB: Date;
  @Prop({
    type:String,
    required: true,
  })
  mobileNumber: string;
  @Prop({
    type: Date,
  })
  deletedAt: Date;
  @Prop({
    type: Date,
  })
  bannedAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  updatedBy: Types.ObjectId;
  @Prop({
    type: Date,
  })
  changeCredenialTime: Date;
  @Prop({
    type: String,
  })
  profilePic: string;
  @Prop({
    type: [String],
  })
  coverPic: string[];
@Prop({
    type:String,
    required:true,
    enum:Object.values(signatureEnum)
  })
  role:signatureEnum;
}
export const userSchema = SchemaFactory.createForClass(User);
userSchema.virtual('otp', {
  localField: '_id',
  foreignField: 'createdBy',
  ref: 'Otp',
});
export type HUserDocument = HydratedDocument<User & { username: string }>;
export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);

userSchema
  .virtual('username')
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (value: string) {
    const [firstName, lastName] = value.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
  });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashing(this.password);
  }
   if (this.isModified('mobileNumber')) {
    this.mobileNumber = await encryption( this.mobileNumber);
  }
});

userSchema.pre(['updateOne', 'findOneAndUpdate'], async function () {
  const update: any = this.getUpdate();

  if (!update) return ;

  // password
  if (update.password) {
    update.password = await hashing(update.password);
  }

  if (update.$set?.password) {
    update.$set.password = await hashing(update.$set.password);
  }

  // mobile number
  if (update.mobileNumber) {
    update.mobileNumber = await encryption(update.mobileNumber);
  }

  if (update.$set?.mobileNumber) {
    update.$set.mobileNumber = await encryption(update.$set.mobileNumber);
  }

  
});

userSchema.post('findOne', function (doc) {
  if (doc?.mobileNumber) {
    doc.mobileNumber = decryption(doc.mobileNumber);
  }
});