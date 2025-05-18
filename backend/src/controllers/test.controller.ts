import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestService } from '../services/test.service';
import { Test } from '../models/test.model';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Test> {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    const content = file.buffer.toString();
    return this.testService.processPythonFile(content);
  }

  @Post('process')
  async processPythonFile(@Body() body: { content: string }): Promise<Test> {
    if (!body.content) {
      throw new NotFoundException('Python content is required');
    }
    return this.testService.processPythonFile(body.content);
  }

  @Get()
  async getAllTests(): Promise<Test[]> {
    return this.testService.getAllTests();
  }

  @Get(':id')
  async getTestById(@Param('id') id: string): Promise<Test> {
    const test = await this.testService.getTestById(id);
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return test;
  }

  @Put(':id/status')
  async updateTestStatus(
    @Param('id') id: string,
    @Body()
    updateData: { status: string; executionTime?: number; error?: string },
  ): Promise<Test> {
    const test = await this.testService.updateTestStatus(
      id,
      updateData.status,
      updateData.executionTime,
      updateData.error,
    );
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return test;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the test to delete' })
  @ApiResponse({ status: 204, description: 'Test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async deleteTest(@Param('id') id: string): Promise<void> {
    const result = await this.testService.deleteTest(id);
    if (!result) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
  }
}
