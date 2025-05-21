import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TestResultService } from "../services/test-result.service";
import { TestResult } from "../models/test-result.model";

@ApiTags("test-results")
@Controller("test-results")
export class TestResultController {
  constructor(private readonly testResultService: TestResultService) {}

  @Post()
  @ApiOperation({ summary: "Save a test result" })
  @ApiResponse({
    status: 201,
    description: "The test result has been successfully saved.",
  })
  async saveTestResult(
    @Body() result: Partial<TestResult>
  ): Promise<TestResult> {
    return this.testResultService.saveTestResult(result);
  }

  @Get()
  @ApiOperation({ summary: "Get all test results" })
  @ApiResponse({ status: 200, description: "Return all test results." })
  async getTestResults(): Promise<TestResult[]> {
    return this.testResultService.getTestResults();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a test result by ID" })
  @ApiResponse({ status: 200, description: "Return the test result." })
  async getTestResultById(@Param("id") id: string): Promise<TestResult> {
    const result = await this.testResultService.getTestResultById(id);
    if (!result) {
      throw new NotFoundException(`Test result with ID ${id} not found`);
    }
    return result;
  }

  @Get("test/:testId/latest")
  @ApiOperation({ summary: "Get the latest test result for a test" })
  @ApiResponse({ status: 200, description: "Return the latest test result." })
  async getLatestTestResult(
    @Param("testId") testId: string
  ): Promise<TestResult> {
    const result = await this.testResultService.getLatestTestResult(testId);
    if (!result) {
      throw new NotFoundException(
        `No test results found for test ID ${testId}`
      );
    }
    return result;
  }

  @Get("test/:testId/stats")
  @ApiOperation({ summary: "Get statistics for test results" })
  @ApiResponse({
    status: 200,
    description: "Return statistics for test results.",
  })
  async getTestResultsStats(@Param("testId") testId: string) {
    return this.testResultService.getTestResultsStats(testId);
  }

  @Get("by-test/:testId")
  async getResultsByTestId(
    @Param("testId") testId: string
  ): Promise<TestResult[]> {
    return this.testResultService.getTestResults(testId);
  }
}
