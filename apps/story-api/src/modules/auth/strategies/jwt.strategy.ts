import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadAppConfig } from '../../../config/app.config.js';

export interface JwtPayload {
  sub: string;
  email?: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const config = loadAppConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
