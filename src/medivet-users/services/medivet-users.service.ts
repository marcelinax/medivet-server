import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUpdateUserDto } from '@/medivet-users/dto/medivet-update-user.dto';
import { MedivetCreateUserDto } from "@/medivet-users/dto/medivet-create-user.dto";
import { MedivetUpdateMyVetSpecializationsDto } from "@/medivet-users/dto/medivet-update-my-vet-specializations.dto";
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';
import { MedivetSearchVetDto } from "@/medivet-users/dto/medivet-search-vet.dto";
import { MedivetSortingModeEnum } from '@/medivet-commons/enums/medivet-sorting-mode.enum';

@Injectable()
export class MedivetUsersService {
    constructor(
        @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>,
        private hashingService: MedivetSecurityHashingService,
        private vetSpecializationsService: MedivetVetSpecializationService
    ) { }

    async createUser(user: MedivetCreateUserDto) : Promise<MedivetUser> {
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

    async updateUser(user: MedivetUser, updateUserDto: MedivetUpdateUserDto): Promise<MedivetUser> {
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
                'clinics.clinic',
                'clinics.specializations',
                'clinics.clinic.receptionTimes',
                'opinions',
                'opinions.issuer',
                'priceLists',
                'priceLists.clinic',
                'priceLists.specialization',
                'priceLists.purposes',
                'specializations'
            ]
        });
        if (!user) throw new NotFoundException(ErrorMessagesConstants.USER_WITH_THIS_ID_DOES_NOT_EXIST);
        return user;
    }

    async findOneByEmail(email: string): Promise<MedivetUser> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    validateUserBirthDate(user: MedivetCreateUserDto): void  {
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

    async findVetById(id: number): Promise<MedivetUser> {
        const possibleVet = await this.findOneById(id);

        if (possibleVet) {
            if (possibleVet.role !== MedivetUserRole.VET) {
                throw new NotFoundException([ErrorMessagesConstants.VET_DOES_NOT_EXIST]);
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

        const vetSpecializationsInUse = vet.clinics.map(clinic => clinic.specializations).flat().map(spec => spec.id);
      
        for (let i = 0; i < vetSpecializationsInUse.length; i++) {
            const specializationId = vetSpecializationsInUse[i];

            if (!specializationIds.includes(specializationId))
                throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_VET_SPECIALIZATION_WHICH_IS_ALREADY_IN_USE]);
        }

        for (let i = 0; i < specializationIds.length; i++) {
            const specializationId = specializationIds[i];

            const specialization = await this.vetSpecializationsService.findVetSpecializationById(specializationId);
                
            if (specialization) specializations.push(specialization);
        }

        vet.specializations = [...specializations];
        await this.saveUser(vet);
        return vet;
    }

    async searchVets(searchVetDto: MedivetSearchVetDto): Promise<MedivetUser[]> {
        const { city, gender, name, sortingMode, specializationIds, clinicName } = searchVetDto;
        let vets = await this.usersRepository.find({
            where: {
                role: MedivetUserRole.VET
            },
            relations: [
                'specializations',
                'clinics',
                'clinics.clinic',
                'opinions',
                'receptionTimes',
                'priceLists',
            ]
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
            const specializationIdsArray = specializationIds.split(',').map(id => +id);
            vets = vets.filter(vet => vet.specializations.some(spec => specializationIdsArray.includes(spec.id)));
        }

        if (clinicName) {
            vets = vets.filter(vet => vet.clinics.some(clinic => clinic?.clinic?.name?.toLowerCase()?.includes(clinicName.toLowerCase())));
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
            })
        }

        const pageSize = searchVetDto.pageSize || 10;
        const offset = searchVetDto.offset || 0;

        return this.paginateVets(vets, pageSize, offset);
    }

    private paginateVets(vets: MedivetUser[], pageSize: number, offset: number): MedivetUser[] {
        return vets.filter((_, index) => index >= offset && index < pageSize + offset);
    }
}