import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';

import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from './user';
import { Company } from './company';
import {
  jobLocationEnum,
  workingTimeEnum,
  seniorityLevelEnum,
} from '../enums/user.enums';
import {type HApplicationDocument } from './application';

@Schema({
  timestamps: true,
})
export class Job {

  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true,
  })
  jobTitle: string;

  @Prop({
    type: String,
    enum: jobLocationEnum,
    required: true,
  })
  jobLocation: jobLocationEnum;

  @Prop({
    type: String,
    enum: workingTimeEnum,
    required: true,
  })
  workingTime: workingTimeEnum;

  @Prop({
    type: String,
    enum: seniorityLevelEnum,
    required: true,
  })
  seniorityLevel: seniorityLevelEnum;

  @Prop({
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000,
  })
  jobDescription: string;

  @Prop({
    type: [String],
    required: true,
  })
  technicalSkills: string[];

  @Prop({
    type: [String],
    required: true,
  })
  softSkills: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  addedBy: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  updatedBy: Types.ObjectId;

  @Prop({
    type: Boolean,
  })
  closed: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
  })
  companyId: Types.ObjectId;

  @Virtual()
  application:HApplicationDocument[];
}

export const jobSchema = SchemaFactory.createForClass(Job);

jobSchema.virtual("application",{
    ref:"Application",
    localField:"_id",
    foreignField:"jobId"
})
export type HJobDocument = HydratedDocument<Job>;

export const JobModel = MongooseModule.forFeature([
  {
    name: Job.name,
    schema: jobSchema,
  },
]);
