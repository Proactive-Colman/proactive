import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TestService } from "./test.service";

@Injectable()
export class TimerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TimerService.name);
  private timer: NodeJS.Timeout;
  private isExecuting = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly testService: TestService
  ) {}

  async onModuleInit() {
    try {
      // Wait for services to be ready
      await this.waitForServices();
      this.startTimer();
    } catch (error) {
      this.logger.error(`Failed to initialize timer service: ${error.message}`);
      throw error;
    }
  }

  onModuleDestroy() {
    this.stopTimer();
  }

  private async waitForServices(retries = 5, delay = 5000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        // Try to fetch tests to verify backend is ready
        await this.testService.getAllTests();
        this.logger.log("Services are ready");
        return;
      } catch (error) {
        if (i === retries - 1) {
          throw new Error("Services not available after maximum retries");
        }
        this.logger.warn(
          `Services not ready, retrying in ${delay / 1000} seconds... (${
            retries - i - 1
          } attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private startTimer() {
    const intervalMinutes =
      this.configService.get<number>("timer.intervalMinutes") || 5;
    const intervalMs = intervalMinutes * 60 * 1000;

    this.logger.log(
      `Starting timer with interval of ${intervalMinutes} minutes`
    );

    // Execute immediately on startup
    this.executeTests();

    // Then set up the interval
    this.timer = setInterval(() => {
      this.executeTests();
    }, intervalMs);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.logger.log("Timer stopped");
    }
  }

  private async executeTests() {
    if (this.isExecuting) {
      this.logger.warn(
        "Previous execution still in progress, skipping this interval"
      );
      return;
    }

    this.isExecuting = true;
    try {
      this.logger.log("Starting scheduled test execution");
      await this.testService.executeAllTests();
      this.logger.log("Completed scheduled test execution");
    } catch (error) {
      this.logger.error(
        `Error during scheduled test execution: ${error.message}`
      );
    } finally {
      this.isExecuting = false;
    }
  }
}
