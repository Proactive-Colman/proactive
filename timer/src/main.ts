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

    const configService = app.get(ConfigService);
    const port = configService.get<number>("port") || 3001;

    await app.listen(port);
    logger.log(`Timer service is running on port ${port}`);
  } catch (error) {
    logger.error(`Failed to start timer service: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
