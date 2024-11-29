import { HttpStatus, Injectable } from '@nestjs/common';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fsExtra from 'fs-extra';
import { promises as fs } from 'fs';

import { Scan } from './entities/scan.entity';
import { CommonService } from '../common/common.service';
import { fileRVIA } from './interface';
import { envs } from 'src/config';
import { RpcException } from '@nestjs/microservices';
import { Checkmarx } from './entities/checkmarx.entity';

@Injectable()
export class RviadocService {

  constructor(
    @InjectRepository(Scan) private readonly scanRepository: Repository<Scan>,
    @InjectRepository(Checkmarx) private readonly checkmarxRepository: Repository<Checkmarx>,
    private readonly encryptionService: CommonService
  ) {  }

  async convertPDF(idu_proyecto: number, idu_aplicacion:number, nom_aplicacion: string,pdfFile: string) {

    try {
      const dirName = envs.pathProjects;
      const tempPDF = join(dirName, pdfFile);

      const fileExists = await fsExtra.pathExists(tempPDF);

      if (!fileExists) {
        throw new RpcException({ 
          status: HttpStatus.NOT_FOUND, 
          message: `Archivo ${pdfFile} no encontrado`
        });
      }

      const newNamePDF = await this.moveAndRenamePdfFile( idu_proyecto, idu_aplicacion, nom_aplicacion, pdfFile );


      const dirAplicacion = `${dirName}/${idu_proyecto}_${nom_aplicacion}`;
  
      await fsExtra.ensureDir(dirAplicacion);
  
      let dataCheckmarx: { message: string; error?: string; isValid?: boolean; checkmarx?: any };
      dataCheckmarx = await this.callPython(nom_aplicacion, newNamePDF, idu_proyecto, idu_aplicacion);

      if (dataCheckmarx.isValid) {
        const scan = new Scan();
        scan.nom_escaneo = this.encryptionService.encrypt(newNamePDF);
        scan.nom_directorio = this.encryptionService.encrypt(join(dirAplicacion, newNamePDF));
        scan.idu_aplicacion = idu_aplicacion;
        await this.scanRepository.save(scan);

        return { message: 'CSV Generado', isValid: true };

      } else {
        await fsExtra.remove(join(dirAplicacion, newNamePDF));
        return dataCheckmarx;
      }

    } catch (error) {
      return { message: 'Error al convertir PDF.', isValid: false , error};
    }
  }

  private async callPython(nameApplication: string, namePdf: string, idu_proyecto: any, idaplicacion: number) {
    const scriptPath = join(__dirname, '../..', 'src/python-scripts', 'recovery.py');
    const execPromise = promisify(exec);

    const command = `python3 ${scriptPath} "${nameApplication}" "${namePdf}" ${idu_proyecto}`;
    try {
      const { stdout, stderr } = await execPromise(command);  

      if (stderr) {
        return { message: 'Error al ejecutar el script.', error: stderr, isValid: false };
      }

      const fileName = `checkmarx_${idu_proyecto}_${nameApplication}.csv`;
      const finalFilePath = join( `${envs.pathProjects}/${idu_proyecto}_${nameApplication}` );

      await fsExtra.ensureDir(finalFilePath);

      const checkmarx = new Checkmarx();
      checkmarx.nom_checkmarx = this.encryptionService.encrypt(fileName);
      checkmarx.nom_directorio = this.encryptionService.encrypt(finalFilePath);
      checkmarx.idu_aplicacion = idaplicacion;


      await this.checkmarxRepository.save(checkmarx);

      return { message: 'CSV Generado', isValid: true };
    } catch (error) {
      return { message: 'Error al ejecutar el script.', error, isValid: false };
    }
  }

  private async moveAndRenamePdfFile(idu_proyecto:number, idu_aplicacion:number, nom_aplicacion:string, pdfFile:string): Promise<string> {

    const tempPDF = join(envs.pathProjects, pdfFile);
    const newPdfFileName = `checkmarx_${idu_proyecto}_${nom_aplicacion}.pdf`;
    const folderProject = `${idu_proyecto}_${nom_aplicacion}`
    const newPdfFilePath = join(envs.pathProjects,folderProject, newPdfFileName);

    try {

      if (await fs.access(newPdfFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(newPdfFilePath);
      }
      
      await fsExtra.move(tempPDF, newPdfFilePath); // Mueve y renombra el archivo

      return newPdfFileName; // Devuelve el nuevo nombre del archivo

    } catch (error) {
      throw new RpcException({ 
        status: HttpStatus.INTERNAL_SERVER_ERROR, 
        message: `Error al mover y renombrar el archivo PDF: ${error.message}`
      });
    }
  }

}
