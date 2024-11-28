import { Controller, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RviadocService } from './rviadoc.service';
import { CreateRviadocDto } from './dto';
import { fileRVIA } from './interface';

@Controller()
export class RviadocController {
  constructor(private readonly rviaDocService: RviadocService) {}
  
  @MessagePattern('rviadoc.upload_pdf')
  uploadPdf(@Payload() data: { 
    dto: CreateRviadocDto, 
    file: fileRVIA 
  }) {
    if (!data.file) {
      throw new BadRequestException('Debes cargar un archivo PDF');
    }

    return this.rviaDocService.convertPDF(data.dto.idu_proyecto, data.dto.nom_aplicacion,data.dto.idu_aplicacion, data.file);
  }

}
