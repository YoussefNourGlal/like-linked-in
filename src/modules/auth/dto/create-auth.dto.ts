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
} from 'class-validator';
import { signatureEnum } from 'src/common/guard/handleTokens';
import { GenderEnum, ProviderEnum } from 'src/DB/enums/user.enums';

@ValidatorConstraint({ name: 'IsAdult', async: false })
export class IsAdult implements ValidatorConstraintInterface {
  validate(date: string) {
    const birthDate = new Date(date);
    const today = new Date();

    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  defaultMessage(args: ValidationArguments) {
    return 'User must be at least 18 years old';
  }
}

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ValidateIf((obj) => obj.provider !== ProviderEnum.GOOGLE)
  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsEnum(signatureEnum)
  @IsNotEmpty()
  role: signatureEnum;

  @IsEnum(ProviderEnum)
  provider: ProviderEnum;

  @IsDateString()
  @Validate(IsAdult)
  DOB: string;

  @IsString()
  mobileNumber:string;
}

export class IRsendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class IConfirmEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ILoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class IforgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class IresetePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  otp: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
