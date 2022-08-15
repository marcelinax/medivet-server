import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable } from '@nestjs/common';
import { envConfig } from '@/medivet-commons/configurations/env-config';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';

const env = envConfig();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: MedivetUsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.ENCRYPT_KEY,
    });
  }

  async validate(payload: MedivetUser) {
    const user = await this.usersService.findOneById(payload.id);
    return user;
  }
}