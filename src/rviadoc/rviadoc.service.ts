import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fsExtra from 'fs-extra';
import { ClientProxy } from '@nestjs/microservices';

import { NATS_SERVICE } from 'src/config';
import { Application } from './dto/application.entity';
import { Checkmarx } from './dto/checkmarx.entity';

@Injectable()
export class RviadocService {
  private readonly crviaEnvironment: number;
    encryptionService: any;

  constructor(
    @InjectRepository(Checkmarx) private readonly checkmarxRepository: Repository<Checkmarx>,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    @InjectRepository(Application) private readonly applicationRepository: Repository<Application>,
  ) {  }

  async create(createCheckmarxDto: any, file: Express.Multer.File) {
    try {
      const aplicacion = await this.client
        .send({ cmd: 'get_application' }, createCheckmarxDto.idu_aplicacion)
        .toPromise();

      const fileName = `checkmarx_${aplicacion.idu_proyecto}_${aplicacion.nom_aplicacion}.csv`;
      const finalFilePath = join(`/sysx/bito/projects/${aplicacion.idu_proyecto}_${aplicacion.nom_aplicacion}`, fileName);

      await rename(`/sysx/bito/projects/${file.filename}`, finalFilePath);

      const checkmarx = new Checkmarx();
      checkmarx.nom_checkmarx = fileName;
      checkmarx.nom_directorio = finalFilePath;
      checkmarx.application = aplicacion;

      await this.checkmarxRepository.save(checkmarx);

      return checkmarx;
    } catch (error) {
      throw new InternalServerErrorException('Error al subir CSV', error.message);
    }
  }

  async convertPDF(createCheckmarxDto: any, file: Express.Multer.File) {
    try {
      const aplicacion = await this.client
        .send({ cmd: 'get_application' }, createCheckmarxDto.idu_aplicacion)
        .toPromise();

      if (aplicacion.num_accion != 2) {
        throw new UnprocessableEntityException('La aplicación debe tener la acción de Sanitización');
      }

      const pdfFileRename = await this.moveAndRenamePdfFile(file, aplicacion);
      const res = await this.callPython(aplicacion.nom_aplicacion, pdfFileRename, aplicacion);

      return res.isValid
        ? res
        : { isValidProcess: false, messageRVIA: res.message };
    } catch (error) {
      throw new InternalServerErrorException('Error al convertir PDF', error.message);
    }
  }

  async findOneByApplication(idu_aplicacion: number) {

    const aplicacion = await this.applicationRepository.findOne({ where: { idu_aplicacion } });

    const checkmarx = await this.checkmarxRepository.findOneBy({ application: aplicacion });

    // if(!checkmarx)
    //   throw new NotFoundException(`Csv no encontrado `);
    if(checkmarx){
      checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
      checkmarx.nom_directorio = this.encryptionService.decrypt(checkmarx.nom_directorio);
    }
    
    return !checkmarx ? [] : checkmarx;
  }

  async downloadCsvFile(id: number, response: any) {
    const checkmarx = await this.checkmarxRepository.findOne({ where: { idu_checkmarx: id } });

    if (!checkmarx) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const filePath = join(checkmarx.nom_directorio);

    if (!existsSync(filePath)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    const fileStream = createReadStream(filePath);

    return fileStream;
  }

  private async callPython(nameApplication: string, namePdf: string, application: any) {
    const scriptPath = join(__dirname, '../..', 'src/python-scripts', 'recovery.py');
    const execPromise = promisify(exec);

    const command = `python3 ${scriptPath} "${nameApplication}" "${namePdf}" ${application.idu_proyecto}`;
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

  private async moveAndRenamePdfFile(file: Express.Multer.File, application: any): Promise<string> {
    const dirAplicacion = `/sysx/bito/projects/${application.idu_proyecto}_${application.nom_aplicacion}`;
    const newPdfFileName = `checkmarx_${application.idu_proyecto}_${application.nom_aplicacion}.pdf`;
    const newPdfFilePath = join(dirAplicacion, newPdfFileName);

    await fsExtra.move(file.path, newPdfFilePath);

    return newPdfFileName;
  }
}
