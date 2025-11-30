import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
import { LoginDto } from './dto/login.dto.js';
import { InvalidCredentialsException } from '../common/exceptions/custom.exceptions.js';
import { UserPayload } from '../common/types/user-request.type.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.userModel
      .findOne({ estado: 'activo' })
      .select('+pin');

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(loginDto.pin, user.pin);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload: UserPayload = {
      userId: user._id.toString(),
      role: user.role,
      nombre: user.nombre,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION')! as any,
    });

    const refreshToken = this.jwtService.sign(
      { userId: user._id.toString() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
        )! as any,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });

      const user = await this.userModel.findById(payload.userId);

      if (!user || user.estado !== 'activo') {
        throw new InvalidCredentialsException();
      }

      const userPayload: UserPayload = {
        userId: user._id.toString(),
        role: user.role,
        nombre: user.nombre,
      };

      const accessToken = this.jwtService.sign(userPayload, {
        secret: this.configService.get<string>('JWT_SECRET')!,
        expiresIn: this.configService.get<string>('JWT_EXPIRATION')! as any,
      });

      return { accessToken };
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }

  async hashPin(pin: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(pin, saltRounds);
  }

  async createUser(nombre: string, pin: string, role: any): Promise<User> {
    const hashedPin = await this.hashPin(pin);
    const user = new this.userModel({
      nombre,
      pin: hashedPin,
      role,
      estado: 'activo',
    });
    return user.save();
  }
}
