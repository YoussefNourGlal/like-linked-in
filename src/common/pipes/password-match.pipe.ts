import {
  BadRequestException,
  Injectable,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class PasswordMatchPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      const { password, confirmpassword } = value;

      if (password !== confirmpassword) {
        throw new BadRequestException(
          'Password and ConfirmPassword do not match',
        );
      }
    }

    return value;
  }
}

