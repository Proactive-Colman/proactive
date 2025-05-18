import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle("Results API")
    .setDescription("API documentation for the results service")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
  console.log(
    `Swagger documentation is available at: http://localhost:3001/api`
  );
}
bootstrap();
