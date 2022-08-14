import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable } from '@nestjs/common';
import { envConfig } from '@/medivet-commons/configurations/env-config';

const env = envConfig();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.ENCRYPT_KEY,
    });
  }

  async validate(payload: any) {
    return { userId: payload.id };
  }
}