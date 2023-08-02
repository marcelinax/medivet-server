import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetVetSpecializationService } from "@/medivet-specializations/services/medivet-vet-specialization.service";
import { MedivetCreateUserDto } from "@/medivet-users/dto/medivet-create-user.dto";
import { MedivetSearchVetDto } from "@/medivet-users/dto/medivet-search-vet.dto";
import { MedivetUpdateMyVetSpecializationsDto } from "@/medivet-users/dto/medivet-update-my-vet-specializations.dto";
import { MedivetUpdateUserDto } from "@/medivet-users/dto/medivet-update-user.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@Injectable()
export class MedivetUsersService {
    constructor(
    @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>,
    private hashingService: MedivetSecurityHashingService,
    private vetSpecializationsService: MedivetVetSpecializationService
    ) {
    }

    async createUser(user: MedivetCreateUserDto): Promise<MedivetUser> {
        const userWithExistingEmail = await this.findOneByEmail(user.email);

        if (userWithExistingEmail) throw new BadRequestException(ErrorMessagesConstants.USER_WITH_THIS_EMAIL_ALREADY_EXISTS);
        this.validateUserBirthDate(user);
        if (!user.acceptTerms) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.TERMS_ARE_NOT_ACCEPTED,
                    property: "acceptTerms"
                }
            ]);
        }

        const hashedPassword = await this.hashingService.hashValue(user.password);

        const newUser = this.usersRepository.create({
            ...user,
            password: hashedPassword
        });
        this.usersRepository.save(newUser);

        return newUser;
    }

    async updateUser(user: MedivetUser, updateUserDto: MedivetUpdateUserDto): Promise<MedivetUser> {
        const { name, phoneNumber, address, birthDate, gender } = updateUserDto;
        user.name = name;
        user.phoneNumber = phoneNumber;
        user.address = {
            buildingNumber: address.buildingNumber,
            city: address.city,
            flatNumber: address.flatNumber,
            street: address.street,
            zipCode: address.zipCode,
        };
        user.birthDate = birthDate;
        user.gender = gender;

        await this.usersRepository.save(user);
        return user;
    }

    async findOneById(id: number, include?: string[]): Promise<MedivetUser> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: include ?? []
        });
        if (!user) {
            throw new NotFoundException({
                message: ErrorMessagesConstants.USER_WITH_THIS_ID_DOES_NOT_EXIST,
                property: "all"
            });
        }
        return user;
    }

    async findOneByEmail(email: string): Promise<MedivetUser> {
        return this.usersRepository.findOne({ where: { email } });
    }

    validateUserBirthDate(user: MedivetCreateUserDto): void {
        const { birthDate } = user;
        const date18YearsAgo = new Date();
        date18YearsAgo.setFullYear(date18YearsAgo.getFullYear() - 18);

        if (birthDate >= new Date()) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY,
                    property: "birthDate"
                }
            ]);
        }
        if (birthDate > date18YearsAgo) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.USER_HAS_TO_BE_AT_LEAST_18_YEARS_OF_AGE,
                    property: "birthDate"
                }
            ]);
        }
    }

    async updateUserPassword(user: MedivetUser, newPassword: string, oldPassword: string): Promise<MedivetUser> {
        const userEntity = await this.usersRepository.findOne({ where: { id: user.id } });

        if (!await this.hashingService.validateHashingValue(oldPassword, userEntity.password)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.WRONG_OLD_PASSWORD,
                    property: "oldPassword"
                }
            ]);
        }

        if (await this.hashingService.validateHashingValue(newPassword, userEntity.password)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.NEW_PASSWORD_THE_SAME_AS_OLD_PASSWORD,
                    property: "newPassword"
                }
            ]);
        }

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

    async findVetById(id: number, include?: string[]): Promise<MedivetUser> {
        const possibleVet = await this.findOneById(id, include);

        if (possibleVet) {
            if (possibleVet.role !== MedivetUserRole.VET) {
                throw new NotFoundException([
                    {
                        message: ErrorMessagesConstants.VET_DOES_NOT_EXIST,
                        property: "all"
                    }
                ]);
            }
            return possibleVet;
        }
    }

    async updateMyVetSpecializations(
        vet: MedivetUser,
        updateMyVetSpecializationsDto: MedivetUpdateMyVetSpecializationsDto
    ): Promise<MedivetUser> {
        const { specializationIds } = updateMyVetSpecializationsDto;
        const specializations = [];

        // przetestować
        const vetSpecializationsInUse = vet.vetAvailabilities.map(vetAvailability => vetAvailability.specialization.id);

        for (let i = 0; i < vetSpecializationsInUse.length; i++) {
            const specializationId = vetSpecializationsInUse[i];

            if (!specializationIds.includes(specializationId)) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_WHICH_IS_ALREADY_IN_USE,
                        property: "all"
                    }
                ]);
            }
        }
        for (let i = 0; i < specializationIds.length; i++) {
            const specializationId = specializationIds[i];

            const specialization = await this.vetSpecializationsService.findOneVetSpecializationById(specializationId);

            if (specialization) specializations.push(specialization);
        }
        vet.specializations = [ ...specializations ];
        await this.saveUser(vet);
        return vet;
    }

    async searchVets(searchVetDto: MedivetSearchVetDto): Promise<MedivetUser[]> {
    // osobne szukanie dla admina
        const { city, gender, name, sortingMode, specializationIds } = searchVetDto;
        let vets = await this.usersRepository.find({
            where: { role: MedivetUserRole.VET },
            relations: searchVetDto?.include ?? []
        });

        if (city) {
            vets = vets.filter(vet => vet?.address?.city?.toLowerCase() === city.toLowerCase());
        }

        if (gender) {
            vets = vets.filter(vet => vet.gender === gender);
        }

        if (name) {
            vets = vets.filter(vet => vet.name.toLowerCase().includes(name.toLowerCase()));
        }

        if (specializationIds) {
            const specializationIdsArray = specializationIds.split(",").map(id => +id);
            vets = vets.filter(vet => vet.specializations.some(spec => specializationIdsArray.includes(spec.id)));
        }

        if (sortingMode) {
            vets = vets.sort((a, b) => {
                const aName: string = a.name.toLowerCase();
                const bName: string = b.name.toLowerCase();
                const aOpinions = a.opinions;
                const bOpinions = b.opinions;
                const aOpinionsAverageRate = aOpinions.length === 0 ? 0 : aOpinions.reduce((acc, cur) => acc + cur.rate, 0) / aOpinions.length;
                const bOpinionsAverageRate = bOpinions.length === 0 ? 0 : bOpinions.reduce((acc, cur) => acc + cur.rate, 0) / bOpinions.length;

                switch (sortingMode) {
                    case MedivetSortingModeEnum.ASC:
                        return aName.localeCompare(bName);
                    case MedivetSortingModeEnum.DESC:
                        return bName.localeCompare(aName);
                    case MedivetSortingModeEnum.HIGHEST_RATE:
                        return bOpinionsAverageRate - aOpinionsAverageRate;
                    case MedivetSortingModeEnum.LOWEST_RATE:
                        return aOpinionsAverageRate - bOpinionsAverageRate;
                    case MedivetSortingModeEnum.MOST_OPINIONS:
                        return bOpinions.length - aOpinions.length;
                    case MedivetSortingModeEnum.LEAST_OPINIONS:
                        return aOpinions.length - bOpinions.length;
                }
            });
        }

        return paginateData(vets, {
            pageSize: searchVetDto.pageSize,
            offset: searchVetDto.offset
        });
    }
}
