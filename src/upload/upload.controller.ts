import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { TestService } from '../test/test.service';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly testService: TestService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueId = uuidv4();
          const ext = extname(file.originalname);
          const filename = `${uniqueId}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    const uniqueId = file.filename; 
    const test = await this.testService.create({
      name,
      description,
    }, uniqueId);

    return {
      test,
      file: {
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      },
    };
  }
} 