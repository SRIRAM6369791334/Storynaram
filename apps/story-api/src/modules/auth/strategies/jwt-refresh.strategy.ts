import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { loadAppConfig } from '../../../config/app.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const config = loadAppConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtRefreshExpiresIn,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }): Promise<{ sub: string; refreshToken: string }> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const refreshToken = req.headers.authorization?.replace('Bearer ', '') ?? '';
    return { ...payload, refreshToken };
  }
}
