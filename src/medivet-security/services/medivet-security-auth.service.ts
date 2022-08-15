import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetAuthLoginDto } from "@/medivet-security/dto/medivet-auth-login.dto";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class MedivetSecurityAuthService {
    constructor(
        private usersService: MedivetUsersService,
        private securityHashingService: MedivetSecurityHashingService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<MedivetUser> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) throw new UnauthorizedException(ErrorMessagesConstants.USER_WITH_THIS_ID_DOES_NOT_EXIST);        
        
        if (!(await this.securityHashingService.validateHashingValue(password, user.password)))
            throw new UnauthorizedException(ErrorMessagesConstants.WRONG_PASSWORD);

        return user;
    }

    async login(authLoginDto: MedivetAuthLoginDto) {
        const user = await this.validateUser(authLoginDto.email, authLoginDto.password);

        const authToken = this.jwtService.sign({ ...user });

        return authToken;
    }
}