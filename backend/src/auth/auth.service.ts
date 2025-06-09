import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../models/user.model';

export interface LoginDto {
  username: string;
  password: string;
}

export interface SignupDto {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, password } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    // Create new user
    const user = new this.userModel({ username, password });
    await user.save();

    // Generate JWT token
    const payload = { username: user.username, sub: user._id };
    const token = this.jwtService.sign(payload);

    return {
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { username: user.username, sub: user._id };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
} 