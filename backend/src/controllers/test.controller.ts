import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { TestService } from '../services/test.service';
import { Test } from '../models/test.model';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

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
}
