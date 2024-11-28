import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fsExtra from 'fs-extra';

import { Scan } from './entities/scan.entity';
import { CommonService } from '../common/common.service';
import { fileRVIA } from './interface';

@Injectable()
export class RviadocService {

  constructor(
    @InjectRepository(Scan) private readonly scanRepository: Repository<Scan>,
    private readonly encryptionService: CommonService
  ) {  }

  async convertPDF(idu_proyecto: number, nom_aplicacion: string,idu_aplicacion: number, file:fileRVIA) {
    try {
      const dirName = '/sysx/bito/projects';
      const dirAplicacion = `${dirName}/${idu_proyecto}_${nom_aplicacion}`;
      const newPdfFileName = `checkmarx_${idu_proyecto}_${nom_aplicacion}.pdf`;
      const finalFilePath = join(dirAplicacion, newPdfFileName);
  
      await fsExtra.ensureDir(dirAplicacion);
  
      const pdfBuffer = Buffer.from(file.buffer.data);
      await fsExtra.writeFile(finalFilePath, pdfBuffer);

      let dataCheckmarx: { message: string; error?: string; isValid?: boolean; checkmarx?: any };
      dataCheckmarx = await this.callPython(nom_aplicacion, newPdfFileName, idu_proyecto);

      if (dataCheckmarx.isValid) {
        const scan = new Scan();
        scan.nom_escaneo = this.encryptionService.encrypt(newPdfFileName);
        scan.nom_directorio = this.encryptionService.encrypt(join(dirAplicacion, newPdfFileName));
        scan.idu_aplicacion = idu_aplicacion;
        await this.scanRepository.save(scan);

        return { message: 'CSV Generado', isValid: true };

      } else {
        await fsExtra.remove(join(dirAplicacion, newPdfFileName));
        return dataCheckmarx;
      }

    } catch (error) {
      return { message: 'Error al convertir PDF.', isValid: false , error};
    }
  }

  private async callPython(nameApplication: string, namePdf: string, idu_proyecto: any) {
    const scriptPath = join(__dirname, '../..', 'src/python-scripts', 'recovery.py');
    const execPromise = promisify(exec);

    const command = `python3 ${scriptPath} "${nameApplication}" "${namePdf}" ${idu_proyecto}`;
    try {
      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        return { message: 'Error al ejecutar el script.', error: stderr, isValid: false };
      }

      return { message: 'CSV Generado', isValid: true };
    } catch (error) {
      return { message: 'Error al ejecutar el script.', error, isValid: false };
    }
  }

}
