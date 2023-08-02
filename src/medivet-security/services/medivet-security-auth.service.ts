import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetMailerService } from "@/medivet-mailer/services/medivet-mailer.service";
import { MedivetAuthLoginDto } from "@/medivet-security/dto/medivet-auth-login.dto";
import { MedivetAuthToken } from "@/medivet-security/entities/medivet-auth-token.entity";
import { MedivetResetPasswordToken } from "@/medivet-security/entities/medivet-reset-password-token.entity";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetSecurityAuthService {
    constructor(
    private usersService: MedivetUsersService,
    private securityHashingService: MedivetSecurityHashingService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MedivetMailerService,
    @InjectRepository(MedivetAuthToken) private authTokenRepository: Repository<MedivetAuthToken>,
    @InjectRepository(MedivetResetPasswordToken) private resetPasswordTokenRepository: Repository<MedivetResetPasswordToken>
    ) {
    }

    async validateUser(email: string, password: string): Promise<MedivetUser> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException([
                {
                    message: ErrorMessagesConstants.USER_WITH_THIS_EMAIL_DOES_NOT_EXIST,
                    property: "email"
                }
            ]);
        }

        if (!(await this.securityHashingService.validateHashingValue(password, user.password))) {
            throw new UnauthorizedException({
                message: ErrorMessagesConstants.WRONG_PASSWORD,
                property: "password"
            });
        }

        return user;
    }

    async login(authLoginDto: MedivetAuthLoginDto): Promise<Record<string, string>> {
        const user = await this.validateUser(authLoginDto.email, authLoginDto.password);

        const authToken = this.jwtService.sign({ id: user.id });

        await this.authTokenRepository.insert({
            token: "Bearer " + authToken,
            user: user,
        });

        return {
            access_token: authToken,
            token_type: "Bearer"
        };
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

    async setTokenLastUseDate(token: string): Promise<void> {
        const tokenEntity = await this.authTokenRepository.findOne({ where: { token } });
        tokenEntity.lastUse = new Date();
        await this.authTokenRepository.save(tokenEntity);
    }

    async generateResetUserPasswordLink(user: MedivetUser): Promise<string> {
        const token = await this.securityHashingService.hashValue(uuid());
        await this.resetPasswordTokenRepository.insert({
            user,
            token
        });
        return `${this.configService.get<string>("ROOT_URL")}static/reset-password?token=${token}`;
    }

    async sendResetUserPasswordLink(userEmail: string): Promise<void> {
        const user = await this.usersService.findOneByEmail(userEmail);
        if (!user) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.USER_WITH_THIS_EMAIL_DOES_NOT_EXIST,
                    property: "email"
                }
            ]);
        }

        const link = await this.generateResetUserPasswordLink(user);
        await this.mailerService.sendResetPasswordLinkMail(userEmail, user.name, link);
    }

    async resetUserPasswordWithToken(token: string, newPassword: string): Promise<void> {
        const resetPasswordTokenObj = await this.resetPasswordTokenRepository.findOne({
            where: { token },
            relations: [ "user" ]
        });

        if (!resetPasswordTokenObj) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.INVALID_RESET_PASSWORD_TOKEN,
                    property: "all"
                }
            ]);
        }
        const user = resetPasswordTokenObj.user;
        if (!user) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.INVALID_RESET_PASSWORD_TOKEN,
                    property: "all"
                }
            ]);
        }
        await this.usersService.forceUpdateUserPassword(user, await this.securityHashingService.hashValue(newPassword));
        await this.resetPasswordTokenRepository.remove(resetPasswordTokenObj);
    }
}
