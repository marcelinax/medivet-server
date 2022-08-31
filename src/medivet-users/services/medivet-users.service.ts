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

        if (userWithExistingEmail) throw new BadRequestException(ErrorMessagesConstants.USER_WITH_THIS_EMAIL_ALREADY_EXISTS);
        this.validateUserBirthDate(user);

        const hashedPassword = await this.hashingService.hashValue(user.password);

        const newUser = this.usersRepository.create({
            ...user,
            password: hashedPassword
        });
        this.usersRepository.save(newUser);

        return newUser;
    }

    async updateUser(user: MedivetUser, updateUserDto: UpdateMedivetUserDto): Promise<MedivetUser> {
        const { name, phoneNumber, address } = updateUserDto;
        user.name = name;
        user.phoneNumber = phoneNumber;
        user.address = {
            buildingNumber: address.buildingNumber,
            city: address.city,
            flatNumber: address.flatNumber,
            street: address.street,
            zipCode: address.zipCode,
        }
       
        await this.usersRepository.save(user);
        return user;
    }

    async findOneById(id: number): Promise<MedivetUser> {
        const user = await this.usersRepository.findOne({
            where: { id }, relations: [
                'clinics',
                'receptionTimes',
                'opinions',
                'opinions.issuer',
            ]
        });
        if (!user) throw new NotFoundException(ErrorMessagesConstants.USER_WITH_THIS_ID_DOES_NOT_EXIST);
        return user;
    }

    async findOneByEmail(email: string): Promise<MedivetUser> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    validateUserBirthDate(user: CreateMedivetUserDto): void  {
        const {birthDate} = user;
        const date18YearsAgo = new Date();
        date18YearsAgo.setFullYear(date18YearsAgo.getFullYear() - 18);

        if (birthDate > date18YearsAgo) throw new BadRequestException(ErrorMessagesConstants.USER_HAS_TO_BE_AT_LEAST_18_YEARS_OF_AGE);
        if(birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

    async updateUserPassword(user: MedivetUser, newPassword: string, oldPassword: string): Promise<MedivetUser> {
        const userEntity = await this.usersRepository.findOne({ where: { id: user.id } });

        if (!await this.hashingService.validateHashingValue(oldPassword, userEntity.password))
            throw new BadRequestException(ErrorMessagesConstants.WRONG_OLD_PASSWORD);
        
        if (await this.hashingService.validateHashingValue(newPassword, userEntity.password))
            throw new BadRequestException(ErrorMessagesConstants.NEW_PASSWORD_THE_SAME_AS_OLD_PASSWORD);
        
        userEntity.password = await this.hashingService.hashValue(newPassword);
        await this.usersRepository.save(userEntity);
        return userEntity;
    }

    async forceUpdateUserPassword(user: MedivetUser, newPassword: string): Promise<MedivetUser> {
        user.password = newPassword;
        this.usersRepository.save(user);
        return user;
    }

    async saveUser(user: MedivetUser): Promise<void> {
        await this.usersRepository.save(user);
    }

}