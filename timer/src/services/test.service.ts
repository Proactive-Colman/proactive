import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { Test } from "../interfaces/test.interface";

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds
  private authToken: string | null = null;

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

  private async getAuthToken(): Promise<string> {
    if (this.authToken) {
      return this.authToken;
    }

    const backendUrl = this.configService.get<string>("backend.url");
    const username = this.configService.get<string>("auth.username");
    const password = this.configService.get<string>("auth.password");

    if (!username || !password) {
      this.logger.error(
        "Timer auth credentials are not configured (TIMER_USERNAME/TIMER_PASSWORD)"
      );
      throw new Error("Missing timer auth credentials");
    }

    const attemptLogin = async (): Promise<string> => {
      const response = await axios.post<{ token: string }>(
        `${backendUrl}/auth/login`,
        { username, password }
      );
      const token = (response.data as any)?.token;
      if (!token) {
        throw new Error("Login succeeded but no token returned");
      }
      return token;
    };

    try {
      const token = await attemptLogin();
      this.authToken = token;
      this.logger.log("Obtained JWT for timer service");
      return token;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.logger.warn(
          "Login failed with 401. Attempting signup then login..."
        );
        try {
          await axios.post(`${backendUrl}/auth/signup`, { username, password });
          const token = await attemptLogin();
          this.authToken = token;
          this.logger.log("Signed up and obtained JWT for timer service");
          return token;
        } catch (innerError) {
          if (innerError instanceof AxiosError) {
            this.logger.error(
              `Failed to signup/login for timer: ${innerError.message} - ${
                innerError.response?.data || "No response data"
              }`
            );
          } else {
            this.logger.error(
              `Failed to signup/login for timer: ${
                (innerError as any)?.message || innerError
              }`
            );
          }
          throw innerError;
        }
      }
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to login for timer: ${error.message} - ${
            error.response?.data || "No response data"
          }`
        );
      } else {
        this.logger.error(
          `Failed to login for timer: ${(error as any)?.message || error}`
        );
      }
      throw error;
    }
  }

  async getAllTests(): Promise<Test[]> {
    try {
      const backendUrl = this.configService.get<string>("backend.url");
      const performRequest = async (): Promise<Test[]> => {
        // Prefer internal route if INTERNAL_SECRET is configured
        const internalSecret = this.configService.get<string>(
          "auth.internalSecret"
        );
        if (internalSecret) {
          const response = await axios.get<Test[]>(
            `${backendUrl}/tests/internal/all`,
            { headers: { "x-internal-secret": internalSecret } }
          );
          return response.data;
        }

        // Fallback to JWT if no internal secret configured
        const token = await this.getAuthToken();
        const response = await axios.get<Test[]>(`${backendUrl}/tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
