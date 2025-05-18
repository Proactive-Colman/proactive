import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TestResult, TestResultDocument } from "../models/test-result.model";

@Injectable()
export class TestResultService {
  private readonly logger = new Logger(TestResultService.name);

  constructor(
    @InjectModel(TestResult.name)
    private testResultModel: Model<TestResultDocument>
  ) {}

  async saveTestResult(result: Partial<TestResult>): Promise<TestResult> {
    const testResult = new this.testResultModel(result);
    const savedResult = await testResult.save();
    this.logger.log(`Saved test result with ID: ${savedResult._id}`);
    return savedResult;
  }

  async getTestResults(testId?: string): Promise<TestResult[]> {
    if (testId) {
      return this.testResultModel.find({ testId }).exec();
    }
    return this.testResultModel.find().exec();
  }

  async getTestResultById(id: string): Promise<TestResult> {
    return this.testResultModel.findById(id).exec();
  }

  async getLatestTestResult(testId: string): Promise<TestResult> {
    return this.testResultModel
      .findOne({ testId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTestResultsStats(testId: string) {
    const results = await this.testResultModel.find({ testId }).exec();

    return {
      totalRuns: results.length,
      successRate:
        results.filter((r) => r.status === "completed").length / results.length,
      averageExecutionTime:
        results.reduce((acc, curr) => acc + curr.executionTime, 0) /
        results.length,
      stepStats: this.calculateStepStats(results),
    };
  }

  private calculateStepStats(results: TestResult[]) {
    const stepStats = new Map<
      string,
      { total: number; success: number; avgDuration: number }
    >();

    results.forEach((result) => {
      result.steps.forEach((step) => {
        if (!stepStats.has(step.name)) {
          stepStats.set(step.name, { total: 0, success: 0, avgDuration: 0 });
        }
        const stats = stepStats.get(step.name)!;
        stats.total++;
        if (step.status === "completed") {
          stats.success++;
        }
        stats.avgDuration =
          (stats.avgDuration * (stats.total - 1) + step.duration) / stats.total;
      });
    });

    return Array.from(stepStats.entries()).map(([name, stats]) => ({
      name,
      successRate: stats.success / stats.total,
      averageDuration: stats.avgDuration,
      totalRuns: stats.total,
    }));
  }
}
