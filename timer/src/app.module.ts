import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TestService } from "./services/test.service";
import { TimerService } from "./services/timer.service";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  providers: [TestService, TimerService],
})
export class AppModule {}
