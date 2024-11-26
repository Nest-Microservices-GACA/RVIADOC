import { Controller, UseInterceptors, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';

import { RviaDocService } from './rviadoc.service';
import { CreateRviadocDto } from './dto/create-rviadoc.dto';
import { fileNamer } from './helper';
import { fileFilterPDF } from './helper/fileFilterpdf';
import { ValidationInterceptor } from '../interceptors/validation-file/validation-file.interceptor';

@Controller()
export class RviaDocController {
  constructor(private readonly rviaDocService: RviaDocService) {}

  @MessagePattern('rviadoc.upload_csv')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        if (file.mimetype === 'text/csv' && ext === 'csv') {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = `/sysx/bito/projects`;
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: fileNamer,
      }),
    }),
    new ValidationInterceptor((dto: CreateRviadocDto) => {
      return true; 
    }),
  )
  async uploadCsv(@Payload() data: { dto: CreateRviadocDto; file: Express.Multer.File }, @Ctx() context: RmqContext) {
    const { dto, file } = data;

    if (!file) {
      throw new BadRequestException('Debes cargar un archivo CSV');
    }

    return this.rviaDocService.create(dto, file);
  }

  @MessagePattern('rviadoc.upload_pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilterPDF,
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = `/sysx/bito/projects`;
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: fileNamer,
      }),
    }),
    new ValidationInterceptor((dto: CreateRviadocDto) => {
      return true; 
    }),
  )
  async uploadPdf(@Payload() data: { dto: CreateRviadocDto; file: Express.Multer.File }, @Ctx() context: RmqContext) {
    const { dto, file } = data;

    if (!file) {
      throw new BadRequestException('Debes cargar un archivo PDF');
    }

    return this.rviaDocService.convertPDF(dto, file);
  }

  @MessagePattern('rviadoc.find_one')
  async findOneByApplication(@Payload() id: number) {
    return this.rviaDocService.findOneByApplication(id);
  }

  @MessagePattern('rviadoc.download_csv')
  async downloadCsv(@Payload() data: { id: number; response: any }) {
    const { id, response } = data;
    return this.rviaDocService.downloadCsvFile(id, response);
  }
}
