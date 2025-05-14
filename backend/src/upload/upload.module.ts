import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TestService } from '../services/test.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestSchema } from '../models/test.model';
import { TestController } from '../controllers/test.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
  ],
  controllers: [UploadController, TestController],
  providers: [UploadService, TestService],
})
export class UploadModule {}
