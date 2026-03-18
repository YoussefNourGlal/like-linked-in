import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { typeTokenEnum } from 'src/common/guard/handleTokens';
import {
  deleteCoverDto,
  updatePasswordDto,
  updateUserDto,
} from './dto/create-user.dto';
import { type Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerImageConfig } from 'src/common/utiles/multer/multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/updateAccount')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  updateAccount(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: updateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.updateAccount(body, req);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  getProfileLogin(@Req() req: Request) {
    return this.userService.getProfileLogin(req);
  }

  @Get('profile/:id')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  getProfile(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Post('/updatePassword')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  updatePassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: updatePasswordDto,
    @Req() req: Request,
  ) {
    return this.userService.updatePassword(body, req);
  }

  @Post('/uploadProfilePic')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  @UseInterceptors(FileInterceptor('file', multerImageConfig('profilePic')))
  uploadProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }
    let profilePic = `profilePic/${file.filename}`;
    return this.userService.uploadProfilePic(profilePic, req);
  }

  @Post('/uploadCoverPic')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  @UseInterceptors(FilesInterceptor('files', 4, multerImageConfig('coverPic')))
  uploadCoverPic(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    if (!files.length) {
      throw new BadRequestException('Image is required');
    }
    let coverPic = files.map(function (file) {
      return `coverPic/${file.filename}`;
    });
    return this.userService.uploadCoverPic(coverPic, req);
  }

  @Delete('/deleteProfilePic')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  deleteProfilePic(@Req() req: Request) {
    return this.userService.deleteProfilePic(req);
  }

  @Delete('/deleteCoverPic')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  deleteCoverPic(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: deleteCoverDto,
    @Req() req: Request,
  ) {
    return this.userService.deleteCoverPic(body.coverPic, req);
  }

  @Delete('/delete_soft')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  softDelete(@Req() req: Request) {
    return this.userService.softDelete(req);
  }
}
