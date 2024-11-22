import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { fileFilterZip, fileNamerZip } from './helper/ZIP';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Auth } from 'src/auth/decorators';
import { CreateApplicationDto, CreateFileDto } from './dto';

import { ValidationInterceptor } from '../interceptors/validation-file/validation-file.interceptor';
import { ValidRoles } from 'src/auth/interfaces';
import { CreateArchitecture } from './dto/create-architecture.dto';
import { CreateDocumentation } from './dto/create-documentation.dto';
import { CreateTestCases } from './dto/create-testcases.dto';
import { CreateRateProject } from './dto/create-rateproject.dto';
import { CreateDocumentationCodigo } from './dto/create-documentation-cod.dto';
import { BadRequestResponse, UnauthorizedResponse, ForbiddenResponse, InternalServerErrorResponse, CreateCommonDto, CreateGitDto, CreateFilesDto, CreateIdDto, CreateDocumentationIdDto, CreateDocumentationCodeIdDto, CreateTestCasesIdDto, CreateRateProjectIdDto, CreateZipIdDto, CreateGitlabDto } from './dto/dto-response'
@ApiTags('Aplicaciones')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Get()

  @ApiResponse({ status: 201, description: 'Aplicaciones recuperadas exitosamente.', type: CreateCommonDto })
  @ApiResponse({ status: 400, description: 'Bad Request.', type: BadRequestResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: UnauthorizedResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.', type: ForbiddenResponse })
  @ApiResponse({ status: 500, description: 'Internal server error.', type: InternalServerErrorResponse })
  findAll(@GetUser() user: User) {
    return this.applicationsService.findAll(user);
  }

  @Post('git')

  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Archivo cargado exitosamente.', type: CreateGitDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status: 500, description: 'Internal server error', type: InternalServerErrorResponse })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
  new ValidationInterceptor((dto: CreateApplicationDto) => {
    return true; 
  })
  )
  create(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitFile(createApplicationDto, user, file);
  }

  @Post('gitlab')

  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Archivo cargado exitosamente.', type: CreateGitlabDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status: 500, description: 'Internal server error', type: InternalServerErrorResponse })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
  new ValidationInterceptor((dto: CreateApplicationDto) => {
    return true;
  }))
  createGitLab(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitLabFile(createApplicationDto, user, file);
  }

  @Post('files')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Archivo subido satisfactoriamente.', type: CreateFilesDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status: 500, description: 'Internal server error', type: InternalServerErrorResponse })

  @UseInterceptors(FilesInterceptor('files', 2, {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    }),
  }),
  new ValidationInterceptor((dto: CreateFileDto) => {
    return true;
  })
  )
  uploadFileZip(
    @Body() createFileDto: CreateFileDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User
  ) {

    if (files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const zipOr7zFile = files.find(file => 
      file.mimetype.includes('zip') || file.mimetype.includes('x-7z-compressed') || file.mimetype.includes('x-zip-compressed')
    );
    const pdfFile = files.find(file => file.mimetype.includes('pdf'));  

    if ( !zipOr7zFile ) {
      throw new BadRequestException('You must upload one ZIP file and one PDF file');
    }

    return this.applicationsService.createFiles(createFileDto, zipOr7zFile, pdfFile, user);

  }
 
  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación que se va a actualizar', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  update(@Param('id', ParseIntPipe) id: number, @Body('estatusId') estatusId: number) {
    return this.applicationsService.update(id, estatusId);
  }

  @Patch('documentation/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para añadir documentación', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateDocumentationIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  addAppDocumentation(@Param('id', ParseIntPipe) id: number, @Body() createDocumentation: CreateDocumentation) {
    return this.applicationsService.addAppDocumentation(id, createDocumentation);
  }
  
  @Patch('documentation-code/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para añadir documentación de código', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateDocumentationCodeIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  addAppDocumentationCode(@Param('id', ParseIntPipe) id: number, @Body() createDocumentationCodigo: CreateDocumentationCodigo) {
    return this.applicationsService.addAppDocumentationCode(id, createDocumentationCodigo);
  }

  @Patch('test-cases/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para añadir casos de prueba', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateTestCasesIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  addApptestCases(@Param('id', ParseIntPipe) id: number, @Body() createTestCases: CreateTestCases) {
    return this.applicationsService.addAppTestCases(id, createTestCases);
  }

  @Patch('rate-project/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para calificar el proyecto', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateRateProjectIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  addAppRateProject(@Param('id', ParseIntPipe) id: number, @Body() createRateProject: CreateRateProject) {
    return this.applicationsService.addAppRateProject(id, createRateProject);
  }

  @Get('zip/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para descargar el archivo ZIP', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateZipIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })

  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {
    await this.applicationsService.getStaticFile7z(id, res);
  }
}
