import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TestService } from '../services/test.service';
import { Test } from '../models/test.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InternalGuard } from '../auth/internal.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tests for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of tests', type: [Test] })
  async getAllTests(@Request() req): Promise<Test[]> {
    return this.testService.getTestsByUser(req.user._id);
  }

  @Get('internal/all')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get all tests (internal only)' })
  @ApiResponse({ status: 200, description: 'List of all tests', type: [Test] })
  async getAllTestsInternal(): Promise<Test[]> {
    return this.testService.getAllTests();
  }

  @Get('internal/:id')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get a test by ID (internal only)' })
  @ApiParam({ name: 'id', description: 'The ID of the test' })
  @ApiResponse({ status: 200, description: 'The test', type: Test })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async getTestByIdInternal(@Param('id') id: string): Promise<Test> {
    return this.testService.getTestById(id);
  }

  @Put('internal/:id/status')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Update a test status (internal only)' })
  @ApiParam({ name: 'id', description: 'The ID of the test to update' })
  @ApiResponse({ status: 200, description: 'Test status updated', type: Test })
  async updateTestStatusInternal(
    @Param('id') id: string,
    @Body() updateData: { status: string; executionTime?: number; error?: string },
  ): Promise<Test | null> {
    return this.testService.updateTestStatus(
      id,
      updateData.status,
      updateData.executionTime,
      updateData.error,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a test by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the test' })
  @ApiResponse({ status: 200, description: 'The test', type: Test })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async getTestById(@Param('id') id: string, @Request() req): Promise<Test> {
    return this.testService.getTestById(id, req.user._id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a test name and description' })
  @ApiParam({ name: 'id', description: 'The ID of the test to update' })
  @ApiResponse({ status: 200, description: 'Test updated successfully', type: Test })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async updateTest(
    @Param('id') id: string,
    @Body() updateData: { name: string; description: string },
    @Request() req,
  ): Promise<Test> {
    const updatedTest = await this.testService.updateTestNameAndDescription(
      id,
      updateData.name,
      updateData.description,
      req.user._id,
    );
    if (!updatedTest) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return updatedTest;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a test by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the test to delete' })
  @ApiResponse({ status: 204, description: 'Test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async deleteTest(@Param('id') id: string, @Request() req): Promise<void> {
    const result = await this.testService.deleteTest(id, req.user._id);
    if (!result) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
  }
}
