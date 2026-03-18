import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import mongoose, { CallbackWithoutResultAndOptionalError, HydratedDocument, Types } from 'mongoose';
import { User } from './user';
import { HJobDocument, Job } from './job';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Company {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    trim: true,
    unique:true
  })
  companyName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  })
  industry: string;

  @Prop({
    type: String,
    required:true
  })
  address: string;
   @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  companyEmail: string;
  @Prop({
    type: Number,
    required:true,
    min: 10,
    max: 20
  })
  numberOfEmployees: number;         
  @Prop({
    type: Boolean,
    default:false
  })
  approvedByAdmin: boolean;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: User.name,
  })
  HRs: Types.ObjectId[];
  @Prop({
    type:String,
  })
  legalAttachment: string;
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
    required:true,
    unique:true
  })
  createdBy: Types.ObjectId;
  @Prop({
    type: String,
  })
  logo: string;
  @Prop({
    type: String,
  })
  coverPic: string;
  @Virtual()
  jobs:HJobDocument[]
}
export const companySchema = SchemaFactory.createForClass(Company);
companySchema.virtual("jobs",{
  localField:"_id",
  foreignField:"companyId",
  ref:"Job"
});
export type HCompanyDocument = HydratedDocument<Company>;
export const CompanyModel = MongooseModule.forFeature([
  {
    name: Company.name,
    schema: companySchema,
  },
]);



