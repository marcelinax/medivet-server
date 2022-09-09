import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSearchClinicDto } from '@/medivet-clinics/dto/medivet-search-clinic.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { MedivetAssignVetToClinicDto } from "@/medivet-clinics/dto/medivet-assign-vet-to-clinic.dto";
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { MedivetClinicToVetWithSpecializationsService } from '@/medivet-clinics/services/medivet-clinic-to-vet-with-specializations.service';
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";

@Injectable()
export class MedivetClinicsService {
    constructor(
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>,
        private usersService: MedivetUsersService,
        private clinicToVetWithSpecializationsService: MedivetClinicToVetWithSpecializationsService
    ) { }
    
    async createClinic(vet: MedivetUser, createClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        if (await this.checkIfClinicAlreadyExists(createClinicDto))
            throw new BadRequestException([ErrorMessagesConstants.CLINIC_ALREADY_EXISTS]);
        
        const newClinic = this.clinicsRepository.create({
            name: createClinicDto.name,
            address: createClinicDto.address,
            creator: vet
        });
        await this.clinicsRepository.save(newClinic);
        return newClinic;
    
    }

    async findClinicById(id: number): Promise<MedivetClinic> {
        const clinic = await this.clinicsRepository.findOne({
            where: { id },
            relations: [
                'vets',
                'vets.specializations',
                'vets.vet.receptionTimes',
                'vets.vet.receptionTimes.clinic',
                'vets.vet.specializations',
                'receptionTimes',
                'receptionTimes.clinic',
                'creator'
            ], 
        });

        if (!clinic) throw new NotFoundException([ErrorMessagesConstants.CLINIC_WITH_THIS_ID_DOES_NOT_EXIST]);
        return clinic;
    }

    private async checkIfClinicAlreadyExists(createClinicDto: MedivetCreateClinicDto): Promise<boolean> {
        const { name, address } = createClinicDto;
        const existingClinic = await this.clinicsRepository.findOne({
            where: {
                name
            }
        });

        if (!existingClinic) return false;
        if (address.buildingNumber === existingClinic.address.buildingNumber &&
            address.city === existingClinic.address.city && address.street === existingClinic.address.street &&
            address.flatNumber === existingClinic.address.flatNumber) return true;
        return false;
    }

    async assignVetToClinic(
        vet: MedivetUser,
        clinicId: number,
        assignVetToClinicDto: MedivetAssignVetToClinicDto)
        : Promise<MedivetUser> {
        const { specializationIds } = assignVetToClinicDto;

        const assignedClinic = await this.clinicToVetWithSpecializationsService
            .createRelationshipBetweenClinicAndVetWithSpecializations(
                {
                    clinicId,
                    vetId: vet.id,
                    specializationIds
                }
            );

        vet.clinics = [...vet.clinics, assignedClinic]
        await this.usersService.saveUser(vet);
        return vet;
    } 

    async unassignVetFromClinic(vet: MedivetUser, clinicId: number): Promise<OkMessageDto> {
        await this.clinicToVetWithSpecializationsService.removeRelationshipBetweenClinicAndVetWithSpecializations(clinicId, vet);
        return { message: SuccessMessageConstants.VET_CLINIC_HAS_BEEN_UNASSIGNED_SUCCESSFULLY };     
    }

    async findAllClinics(): Promise<MedivetClinic[]> {
        return this.clinicsRepository.find({
            relations: [
                'vets',
                'vets.specializations',
                'vets.vet.receptionTimes',
                'vets.vet.receptionTimes.clinic',
                'vets.vet.specializations',
                'receptionTimes',
                'receptionTimes.clinic',
                'creator'
        ]});
    }

    async searchClinics(searchClinicDto: MedivetSearchClinicDto): Promise<MedivetClinic[]> {
        let clinics = await this.findAllClinics();

        if (searchClinicDto.name) {
            clinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(searchClinicDto.name.toLowerCase()));
        }

        if (searchClinicDto.city) {
            clinics = clinics.filter(clinic => clinic?.address?.city.toLowerCase() === searchClinicDto.city.toLowerCase());
        }

        if (searchClinicDto.street) {
            clinics = clinics.filter(clinic => clinic?.address?.street.toLowerCase() === searchClinicDto.street.toLowerCase());
        }

        if (searchClinicDto.zipCode) {
            clinics = clinics.filter(clinic => clinic?.address?.street.toLowerCase() === searchClinicDto.zipCode.toLowerCase());
        }

        if (searchClinicDto.buildingNumber) {
            clinics = clinics.filter(clinic => clinic?.address?.buildingNumber === searchClinicDto.buildingNumber);
        }
        
        if (searchClinicDto.flatNumber) {
            clinics = clinics.filter(clinic => clinic?.address?.flatNumber === searchClinicDto.flatNumber);
        }

        if (searchClinicDto.sortingMode) {
            clinics = clinics.sort((a, b) => {
                const aName: string = a.name.toLowerCase();
                const bName: string = b.name.toLowerCase();
                
                switch (searchClinicDto.sortingMode) {
                    case MedivetSortingModeEnum.ASC:
                        return aName.localeCompare(bName);
                    case MedivetSortingModeEnum.DESC:
                            return bName.localeCompare(aName);
                }
            })
        }

        const pageSize = searchClinicDto.pageSize || 10;
        const offset = searchClinicDto.offset || 0;

        return this.paginateClinics(clinics, offset, pageSize);
    }

    private paginateClinics(clinics: MedivetClinic[], offset: number, pageSize: number): MedivetClinic[] {
        return clinics.filter((_, index) => index >= offset && index < offset + pageSize);
    }

    async removeClinic(clinicId: number, vet: MedivetUser): Promise<void> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            if (clinic?.creator?.id === vet.id) {
                const isClinicInUse = await this.clinicToVetWithSpecializationsService.checkIfClinicIsAssigned(clinicId);
                if (isClinicInUse)
                    throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_VET_CLINIC_WHICH_IS_IN_USE]);
               
                await this.clinicsRepository.remove(clinic);
            }
            else throw new BadRequestException([ErrorMessagesConstants.YOU_ARE_NOT_ABLE_TO_REMOVE_THIS_VET_CLINIC]);
        }
    }

}