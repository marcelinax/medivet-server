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
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>
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
        const clinic = this.clinicsRepository.findOne({ where: { id } });

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

}