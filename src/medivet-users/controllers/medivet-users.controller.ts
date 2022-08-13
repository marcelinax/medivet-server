import { PathConstants } from "@/medivet-commons/constants/path.constants";
import { CreateMedivetUserDto } from "@/medivet-users/dto/create-medivet-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { Body, Controller, Post } from "@nestjs/common";

@Controller(PathConstants.USERS)
export class MedivetUsersController {
    constructor(private usersService: MedivetUsersService){}

    @Post()
    createMedivetUser(@Body() body: CreateMedivetUserDto): Promise<MedivetUser> {
        return this.usersService.createUser(body);
    }
}