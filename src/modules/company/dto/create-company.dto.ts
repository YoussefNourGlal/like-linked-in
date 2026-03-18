import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  description: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  companyEmail: string;

  @IsNumber()
  @Min(10)
  @Max(20)
  numberOfEmployees: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  HRs: string[];

  @IsOptional()
  @IsString()
  legalAttachment?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  coverPic?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: Types.ObjectId;
}
