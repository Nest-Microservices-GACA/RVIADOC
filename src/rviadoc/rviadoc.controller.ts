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

    return this.rviaDocService.convertPDF(data);
  }

}
