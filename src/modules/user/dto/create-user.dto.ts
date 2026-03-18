import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsDateString,
  IsNumber,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsOptional,
} from 'class-validator';
import { signatureEnum } from 'src/common/guard/handleTokens';
import { GenderEnum, ProviderEnum } from 'src/DB/enums/user.enums';
import { IsAdult } from 'src/modules/auth/dto/create-auth.dto';

export class updateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(25)
  @IsOptional()
  lastName?: string;

  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @IsDateString()
  @Validate(IsAdult)
  @IsOptional()
  DOB?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;
}



export class updatePasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

}

export class deleteCoverDto {
  @IsString()
  @IsNotEmpty()
 coverPic: string;

}
