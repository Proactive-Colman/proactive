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
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TestService } from '../services/test.service';
import { ApiConsumes, ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Test } from '../models/test.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class PythonFileValidator extends FileValidator<Record<string, any>> {
  constructor() {
    super({});
  }

  isValid(file: Express.Multer.File): boolean {
    const validMimeTypes = [
      'text/x-python-script',
      'text/x-python',
      'application/x-python-code',
      'application/octet-stream'
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

@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('upload')
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
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new PythonFileValidator(),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req,
  ): Promise<Test> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileContent = file.buffer.toString('utf-8');
    const test = await this.testService.processPythonFile(fileContent, req.user._id);

    // Update test with name and description if provided
    if (name || description) {
      const updatedTest = await this.testService.updateTestNameAndDescription(
        (test as any)._id.toString(),
        name || test.name,
        description || test.description,
        req.user._id,
      );
      if (!updatedTest) {
        throw new BadRequestException('Failed to update test with name and description');
      }
      return updatedTest;
    }

    return test;
  }
}
