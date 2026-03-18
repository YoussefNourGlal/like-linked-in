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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard, TokenType } from 'src/common/guard/auth.guard';
import { typeTokenEnum } from 'src/common/guard/handleTokens';
import { type Request } from 'express';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageConfig } from 'src/common/utiles/multer/multer';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    createCompanyDto.createdBy = req.user?._id;
    return this.companyService.create(createCompanyDto);
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  update(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateCompanyDto: UpdateCompanyDto,
    @Req() req: Request,
  ) {
    if (!updateCompanyDto) {
      throw new BadRequestException('no data for update ');
    }
    return this.companyService.update(updateCompanyDto, req);
  }

  @Delete('delete_soft/:id')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.companyService.soft_delete(req, id);
  }

  @Get('searchByName/:name')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  searchByName(@Param('name') name: string) {
    return this.companyService.searchByName(name);
  }

  @Post('/uploadLogo')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  @UseInterceptors(FileInterceptor('file', multerImageConfig('companyLogo')))
  uploadlogo(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }
    let logo = `companyLogo/${file.filename}`;
    return this.companyService.uploadlogo(logo, req);
  }

  @Post('/uploadCover')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  @UseInterceptors(FileInterceptor('file', multerImageConfig('companyCover')))
  uploadCover(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }
    let cover = `companyCover/${file.filename}`;
    return this.companyService.uploadcover(cover, req);
  }

  @Delete('/logo')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  deletelogo(@Req() req: Request) {
    return this.companyService.deletelogo(req);
  }

  @Delete('/cover')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
  deleteProfilePic(@Req() req: Request) {
    return this.companyService.deletecover(req);
  }

@Get(':companyId')
  @UseGuards(AuthGuard)
  @TokenType(typeTokenEnum.access)
 getCompany(@Param('companyId') companyId: string) {
    return this.companyService.getCompany(companyId);
  }



}
