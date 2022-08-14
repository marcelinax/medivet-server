import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { MedivetSecurityAuthService } from "../services/medivet-security-auth.service";
import { MedivetAuthLoginDto } from '@/medivet-security/dto/medivet-auth-login.dto';
import { PathConstants } from "@/medivet-commons/constants/path.constants";

@Controller(PathConstants.AUTH)
export default class MedivetSecurityAuthController {
    constructor(
        private readonly securityAuthService: MedivetSecurityAuthService
    ) { }
    
    @Post(PathConstants.LOGIN)
    login(
        @Body()
        authLoginDto: MedivetAuthLoginDto
    ) {
        return this.securityAuthService.login(authLoginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(PathConstants.ME)
    getMe(@Request() req) {
        return req.user;
    }
}