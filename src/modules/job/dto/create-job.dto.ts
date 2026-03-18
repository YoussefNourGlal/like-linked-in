import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';
import {
  jobLocationEnum,
  seniorityLevelEnum,
  workingTimeEnum,
} from 'src/DB/enums/user.enums';

export enum applicationStatusMiniEnum {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  jobTitle: string;

  @IsEnum(jobLocationEnum)
  @IsNotEmpty()
  jobLocation: jobLocationEnum;

  @IsEnum(workingTimeEnum)
  @IsNotEmpty()
  workingTime: workingTimeEnum;

  @IsEnum(seniorityLevelEnum)
  @IsNotEmpty()
  seniorityLevel: seniorityLevelEnum;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  jobDescription: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technicalSkills: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  softSkills: string[];

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @IsMongoId()
  @IsOptional()
  addedBy?: Types.ObjectId;
}

export class DeleteJobDto {
  @IsMongoId()
  @IsNotEmpty()
  jobId: string;
}

// for limit and page only
export class getJobDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}

export class getJobWithFilterDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  jobTitle?: string;

  @IsEnum(jobLocationEnum)
  @IsOptional()
  jobLocation?: jobLocationEnum;

  @IsEnum(workingTimeEnum)
  @IsOptional()
  workingTime?: workingTimeEnum;

  @IsEnum(seniorityLevelEnum)
  @IsOptional()
  seniorityLevel?: seniorityLevelEnum;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  technicalSkills?: string[];
}



export class ApplicationStatusDto {
  
  @IsNotEmpty()
  @IsEnum(applicationStatusMiniEnum)
 status: applicationStatusMiniEnum;
}