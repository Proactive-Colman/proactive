import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TestModule } from '../test/test.module';

@Module({
  imports: [TestModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {} 