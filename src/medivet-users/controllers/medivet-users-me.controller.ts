import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { CurrentUser } from "@/medivet-security/decorators/medivet-current-user.decorator";
import { JwtAuthGuard } from "@/medivet-security/guards/jwt-auth.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { MedivetUser } from "../entities/medivet-user.entity";

@Controller(`${PathConstants.USERS}/${PathConstants.ME}`)
export class MedivetUsersMeController {

    @UseGuards(JwtAuthGuard)
    @Get()
    getMe(@CurrentUser() user): Promise<MedivetUser>{
        return user;
    }
}