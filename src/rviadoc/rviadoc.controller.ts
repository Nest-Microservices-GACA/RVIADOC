import { Controller, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RviadocService } from './rviadoc.service';
import { CreateRviadocDto } from './dto';
import { fileRVIA } from './interface';

@Controller()
export class RviadocController {
  constructor(private readonly rviaDocService: RviadocService) {}
  
  @MessagePattern('rviadoc.upload_pdf')
  uploadPdf(@Payload() data: CreateRviadocDto) {
    // if (!data.file) {
    //   throw new BadRequestException('Debes cargar un archivo PDF');
    // }
    // path_pdf
    return this.rviaDocService.convertPDF(data.idu_proyecto, data.idu_aplicacion,data.nom_aplicacion,data.pdfFile);
  }

}
