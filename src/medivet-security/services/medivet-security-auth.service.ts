import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetAuthLoginDto } from "@/medivet-security/dto/medivet-auth-login.dto";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetAuthToken } from "@/medivet-users/entities/medivet-auth-token.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MedivetSecurityAuthService {
    constructor(
        private usersService: MedivetUsersService,
        private securityHashingService: MedivetSecurityHashingService,
        private jwtService: JwtService,
       @InjectRepository(MedivetAuthToken) private authTokenRepository: Repository<MedivetAuthToken>
    ) { }

    async validateUser(email: string, password: string): Promise<MedivetUser> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) throw new UnauthorizedException(ErrorMessagesConstants.USER_WITH_THIS_EMAIL_DOES_NOT_EXIST);        
        
        if (!(await this.securityHashingService.validateHashingValue(password, user.password)))
            throw new UnauthorizedException(ErrorMessagesConstants.WRONG_PASSWORD);

        return user;
    }

    async login(authLoginDto: MedivetAuthLoginDto) {
        const user = await this.validateUser(authLoginDto.email, authLoginDto.password);

        const authToken = this.jwtService.sign({id: user.id});

        await this.authTokenRepository.insert({
            token: "Bearer " + authToken,
            user: user,
        });

        return authToken;
    }

    async validateAuthToken(token: string): Promise<boolean> {
       return !!await this.authTokenRepository.findOne({
           where: {
               token,
               active: true
           }
       });
   }
    
    async logout(token: string): Promise<void> {
        const tokenEntity = await this.authTokenRepository.findOne({ where: { token } });
        tokenEntity.active = false;
        await this.authTokenRepository.save(tokenEntity);
    }
}