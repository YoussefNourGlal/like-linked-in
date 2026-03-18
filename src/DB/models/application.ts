import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import mongoose, { HydratedDocument, Types } from 'mongoose';
import { applicationStatusEnum } from '../enums/user.enums'

@Schema({
  timestamps: true,
})
export class Application {

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  })
  jobId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  userCV: string ;


  @Prop({
    type: String,
    enum: applicationStatusEnum,
    default: applicationStatusEnum.PENDING,
  })
  status: applicationStatusEnum;
}

export const applicationSchema = SchemaFactory.createForClass(Application);

export type HApplicationDocument = HydratedDocument<Application>;

export const ApplicationModel = MongooseModule.forFeature([
  {
    name: Application.name,
    schema: applicationSchema,
  },
]);
