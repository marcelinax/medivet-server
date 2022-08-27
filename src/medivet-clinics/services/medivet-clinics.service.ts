import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

@Injectable()
export class MedivetClinicsService {
    constructor(
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>,
        @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>
    ) { }
    
    async createClinic(vet: MedivetUser, createClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
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
        const clinic = await this.clinicsRepository.findOne({ where: { id } });

        if (!clinic) throw new NotFoundException([ErrorMessagesConstants.CLINIC_WITH_THIS_ID_DOES_NOT_EXIST]);
        return clinic;
    }

    async checkIfClinicAlreadyExists(createClinicDto: MedivetCreateClinicDto): Promise<boolean> {
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
            if(hasVetThisClinic) throw new BadRequestException([ErrorMessagesConstants.VET_IS_ALREADY_ASSIGNS_TO_THIS_VET_CLINIC])
            vet.clinics = vet.clinics ? [...vet.clinics, clinic] : [clinic];
            await this.usersRepository.save(vet);
            await this.clinicsRepository.save(clinic);
            return vet;
        }
    }

    async unassignVetFromClinic(vet: MedivetUser, clinicId: number): Promise<MedivetUser> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            const hasVetThisClinic = vet.clinics?.find(x => x.id === clinic.id);
            if (!hasVetThisClinic) throw new BadRequestException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
            const newVetClinics = [...vet.clinics];
            newVetClinics.splice(newVetClinics.indexOf(clinic), 1);
            vet.clinics = [...newVetClinics];
            await this.usersRepository.save(vet);
            await this.clinicsRepository.save(clinic);
            return vet;
        }
    }

}