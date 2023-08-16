import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserDeleteLog } from "@/medivet-users/entities/medivet-user-delete-log.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@Injectable()
export class MedivetAnonymizeUserService {
    constructor(
        @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>,
        @InjectRepository(MedivetUserDeleteLog) private usersDeletedLogRepository: Repository<MedivetUserDeleteLog>,
    ) { }

    async anonymizeUser(user: MedivetUser): Promise<void> {
        user.birthDate = new Date(null);
        user.email = "";
        user.name = "";
        user.phoneNumber = "";
        user.profilePhotoUrl = "";
        user.gender = MedivetGenderEnum.UNKNOWN;
        user.role = MedivetUserRole.REMOVED;
        user.profilePhotoUrl = "";
        this.usersRepository.save(user);
        this.usersDeletedLogRepository.insert({ user });
    }
}
