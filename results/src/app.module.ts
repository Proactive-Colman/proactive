import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TestResult, TestResultSchema } from "./models/test-result.model";
import { TestResultService } from "./services/test-result.service";
import { TestResultController } from "./controllers/test-result.controller";
import { SwaggerModule } from "@nestjs/swagger";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        "mongodb://admin:bartar20%40CS@host.docker.internal:21771/proactive?authSource=admin"
    ),
    MongooseModule.forFeature([
      { name: TestResult.name, schema: TestResultSchema },
    ]),
  ],
  controllers: [TestResultController],
  providers: [TestResultService],
})
export class AppModule {}
