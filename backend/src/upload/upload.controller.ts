import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  FileValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TestService } from '../services/test.service';
import { ApiConsumes, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Test } from '../models/test.model';

class PythonFileValidator extends FileValidator<Record<string, any>> {
  constructor() {
    super({});
  }

  isValid(file: Express.Multer.File): boolean {
    const validMimeTypes = [
      'text/x-python-script',
      'text/x-python',
      'application/x-python-code',
    ];
    const validExtensions = ['.py'];

    const extension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));
    return (
      validMimeTypes.includes(file.mimetype) ||
      validExtensions.includes(extension)
    );
  }

  buildErrorMessage(): string {
    return 'File must be a Python file (.py)';
  }
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Test created from uploaded file',
    type: Test,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or request data',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.py$/)) {
          return callback(
            new BadRequestException('Only Python files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024, // 5MB
          }),
          new PythonFileValidator(),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: { name: string; description: string },
  ): Promise<Test> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Log file details for debugging
      console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'Buffer exists' : 'No buffer',
      });

      if (!file.buffer) {
        throw new BadRequestException(
          'File buffer is empty. Please ensure the file is being properly uploaded.',
        );
      }

      if (!body.name || !body.description) {
        throw new BadRequestException('Name and description are required');
      }

      const pythonContent = file.buffer.toString('utf-8');
      const test = await this.testService.processPythonFile(pythonContent);
      test.name = body.name;
      test.description = body.description;
      return test;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to process Python file: ' + error.message,
      );
    }
  }
}
