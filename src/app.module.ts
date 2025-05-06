import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestModule } from './test/test.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port:  5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Disabled for manual table handling
    }),
    TestModule,
    UploadModule,
  ],
})
export class AppModule {}
