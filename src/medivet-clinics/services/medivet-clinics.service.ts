import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSearchClinicDto } from '@/medivet-clinics/dto/medivet-search-clinic.dto';
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";

@Injectable()
export class MedivetClinicsService {
    constructor(
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>,
        @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>
    ) { }
    
    async createClinic(createClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        if (await this.checkIfClinicAlreadyExists(createClinicDto))
            throw new BadRequestException([ErrorMessagesConstants.CLINIC_ALREADY_EXISTS]);
        
        const newClinic = this.clinicsRepository.create({
            name: createClinicDto.name,
            address: createClinicDto.address
        });
        await this.clinicsRepository.save(newClinic);
        return newClinic;
    
    }

    async findClinicById(id: number): Promise<MedivetClinic> {
        const clinic = await this.clinicsRepository.findOne({
            where: { id }, relations: [
                'vets',
                'vets.receptionTimes',
                'vets.receptionTimes.clinic',
                'vets.specializations',
                'receptionTimes',
                'receptionTimes.clinic'
            ]
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

    async assignVetToClinic(vet: MedivetUser, clinicId: number): Promise<MedivetUser> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            const hasVetThisClinic = vet.clinics?.find(x => x.id === clinic.id);
            if(hasVetThisClinic) throw new BadRequestException([ErrorMessagesConstants.VET_IS_ALREADY_ASSIGNED_TO_THIS_VET_CLINIC])
            vet.clinics = vet.clinics ? [...vet.clinics, clinic] : [clinic];
            await this.usersRepository.save(vet);
            return vet;
        }
    }

    async unassignVetFromClinic(vet: MedivetUser, clinicId: number): Promise<MedivetUser> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            const hasVetThisClinic = vet.clinics?.find(x => x.id === clinic.id);
            if (!hasVetThisClinic) throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
            const newVetClinics = [...vet.clinics];
            newVetClinics.splice(newVetClinics.indexOf(clinic), 1);
            vet.clinics = [...newVetClinics];
            await this.usersRepository.save(vet);
            await this.clinicsRepository.save(clinic);
            return vet;
        }
    }

    async findAllClinics(): Promise<MedivetClinic[]> {
        return this.clinicsRepository.find({
            relations: [
                'vets',
                'vets.receptionTimes',
                'vets.receptionTimes.clinic',
                'vets.specializations',
                'receptionTimes',
                'receptionTimes.clinic'
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

}