import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadModule } from './upload/upload.module';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { User, UserSchema } from './models/user.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/proactive'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    UploadModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule {}
