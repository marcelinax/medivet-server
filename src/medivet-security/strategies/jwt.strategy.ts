import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable } from '@nestjs/common';
import { envConfig } from '@/medivet-commons/configurations/env-config';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

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

  async validate(payload: MedivetUser) {
    return { ...payload };
  }
}