import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { envConfig } from '@/medivet-commons/configurations/env-config';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { MedivetSecurityAuthService } from '@/medivet-security/services/medivet-security-auth.service';

const env = envConfig();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: MedivetUsersService,
    private authSecurityService: MedivetSecurityAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: env.ENCRYPT_KEY,
    });
  }

  async validate(req: Request, payload: MedivetUser) {
    const token = req.headers['authorization'];

    if (!await this.authSecurityService.validateAuthToken(token)) throw new UnauthorizedException();
    await this.authSecurityService.setTokenLastUseDate(token);
    const user = await this.usersService.findOneById(payload.id);
    return user;
  }
}