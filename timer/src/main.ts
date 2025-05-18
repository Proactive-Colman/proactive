import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
    });

    // Initialize the app without listening on a port
    await app.init();
    logger.log("Timer service initialized successfully");
  } catch (error) {
    logger.error(`Failed to start timer service: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
