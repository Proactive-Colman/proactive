import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { TestService } from './test.service';
import { Test } from './test.entity';
import { Response } from 'express';
import { join } from 'path';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  create(@Body() test: Partial<Test>): Promise<Test> {
    return this.testService.create(test);
  }

  @Get()
  findAll(): Promise<Test[]> {
    return this.testService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Test> {
    return this.testService.findOne(id);
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const test = await this.testService.findOne(id);
    const filePath = join(process.cwd(), 'uploads', test.filename);
    return res.sendFile(filePath);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() test: Partial<Test>): Promise<Test> {
    return this.testService.update(id, test);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.testService.remove(id);
  }
}
