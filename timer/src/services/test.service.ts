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

  // Removed JWT login/signup; timer uses internal route secured by INTERNAL_SECRET

  async getAllTests(): Promise<Test[]> {
    try {
      const backendUrl = this.configService.get<string>("backend.url");
      const performRequest = async (): Promise<Test[]> => {
        const internalSecret = this.configService.get<string>(
          "auth.internalSecret"
        );
        if (!internalSecret) {
          throw new Error(
            "INTERNAL_SECRET is not configured for timer; cannot call internal API"
          );
        }
        const response = await axios.get<Test[]>(
          `${backendUrl}/tests/internal/all`,
          { headers: { "x-internal-secret": internalSecret } }
        );
        return response.data;
      };
      const data = await this.retry(() => performRequest());
      return data;
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
      await this.retry(() => axios.post(`${executorUrl}/execute/${testId}`));
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
        if (!test._id) {
          this.logger.warn(
            `Test ID is undefined for test: ${JSON.stringify(test)}`
          );
          continue;
        }
        try {
          await this.executeTest(test._id);
        } catch (error) {
          this.logger.error(
            `Failed to execute test ${test._id}: ${error.message}`
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
