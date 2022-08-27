import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinicsReceptionTime } from '@/medivet-clinics/entities/medivet-clinics-reception-time.entity';
import { Repository } from 'typeorm';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

@Injectable()
export class MedivetClinicsReceptionTimesService {
    constructor(
        @InjectRepository(MedivetClinicsReceptionTime) private clinicsReceptionTimesRepository: Repository<MedivetClinicsReceptionTime>
        ) { }
    
    async createClinicReceptionTime() {

    }

    async findClinicReceptionTimeById(id: number): Promise<MedivetClinicsReceptionTime> {
        const receptionTime = await this.clinicsReceptionTimesRepository.findOne({ where: { id } });
        
        if (!receptionTime) throw new NotFoundException([ErrorMessagesConstants.CLINIC_RECEPTION_TIME_WITH_THIS_ID_DOES_NOT_EXIST]);
        return receptionTime;
    }
}