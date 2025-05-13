import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { Test } from "../interfaces/test.interface";

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(private readonly configService: ConfigService) {}

  private async retry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Operation failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  async getAllTests(): Promise<Test[]> {
    try {
      const backendUrl = this.configService.get<string>("backend.url");
      const response = await this.retry(() =>
        axios.get<Test[]>(`${backendUrl}/tests`)
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to fetch tests: ${error.message} - ${
            error.response?.data || "No response data"
          }`
        );
      } else {
        this.logger.error(`Failed to fetch tests: ${error.message}`);
      }
      throw error;
    }
  }

  async executeTest(testId: string): Promise<void> {
    try {
      const executorUrl = this.configService.get<string>("executor.url");
      await this.retry(() =>
        axios.post(`${executorUrl}/execute`, { test_id: testId })
      );
      this.logger.log(`Successfully executed test: ${testId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to execute test ${testId}: ${error.message} - ${
            error.response?.data || "No response data"
          }`
        );
      } else {
        this.logger.error(`Failed to execute test ${testId}: ${error.message}`);
      }
      throw error;
    }
  }

  async executeAllTests(): Promise<void> {
    try {
      const tests = await this.getAllTests();
      this.logger.log(`Found ${tests.length} tests to execute`);

      for (const test of tests) {
        try {
          await this.executeTest(test.id);
        } catch (error) {
          this.logger.error(
            `Failed to execute test ${test.id}: ${error.message}`
          );
          // Continue with next test even if one fails
          continue;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to execute all tests: ${error.message}`);
      throw error;
    }
  }
}
