import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { CreateMedivetUserDto } from "@/medivet-users/dto/create-medivet-user.dto";
import { UpdateMedivetUserDto } from "@/medivet-users/dto/update-medivet-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MedivetUsersService {
    constructor(
        @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>,
        private hashingService: MedivetSecurityHashingService
    ) { }

    async createUser(user: CreateMedivetUserDto) : Promise<MedivetUser> {
        const userWithExistingEmail = await this.findOneByEmail(user.email);
        console.log(userWithExistingEmail)

        if (userWithExistingEmail) throw new BadRequestException(ErrorMessagesConstants.USER_WITH_THIS_EMAIL_ALREADY_EXISTS);

        const hashedPassword = await this.hashingService.hashValue(user.password);

        const newUser = this.usersRepository.create({
            ...user,
            password: hashedPassword
        });
        this.usersRepository.save(newUser);

        return newUser;
    }

    async updateUser(user: MedivetUser, updateUserDto: UpdateMedivetUserDto): Promise<MedivetUser> {
        const { name, phoneNumber } = updateUserDto;
        user.name = name;
        user.phoneNumber = phoneNumber;
        this.usersRepository.save(user);
        return user;
    }

    async findOneById(id: number): Promise<MedivetUser> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(ErrorMessagesConstants.USER_WITH_THIS_ID_DOES_NOT_EXIST);
        return user;
    }

    async findOneByEmail(email: string): Promise<MedivetUser> {
        return await this.usersRepository.findOne({ where: { email } });
    }

}