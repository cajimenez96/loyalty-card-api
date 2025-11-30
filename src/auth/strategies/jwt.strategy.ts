import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema.js';
import { UserPayload } from '../../common/types/user-request.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    const user = await this.userModel.findById(payload.userId);

    if (!user || user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return {
      userId: payload.userId,
      role: payload.role,
      nombre: payload.nombre,
    };
  }
}
