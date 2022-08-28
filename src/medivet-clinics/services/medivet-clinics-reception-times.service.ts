import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinicsReceptionTime } from '@/medivet-clinics/entities/medivet-clinics-reception-time.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivietCreateClinicsReceptionTimeDto } from '@/medivet-clinics/dto/medivet-create-clinics-reception-time.dto';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';

@Injectable()
export class MedivetClinicsReceptionTimesService {
    constructor(
        @InjectRepository(MedivetClinicsReceptionTime) private clinicsReceptionTimesRepository: Repository<MedivetClinicsReceptionTime>,
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>,
        private clinicsService: MedivetClinicsService,
    ) { }
    
    async createClinicReceptionTime(vet: MedivetUser, createClinicReceptionTimeDto: MedivietCreateClinicsReceptionTimeDto) {
        const { day, endTime, startTime, clinicId } = createClinicReceptionTimeDto;
        
        const clinic = await this.clinicsService.findClinicById(clinicId);
        
        if (clinic) {
            const clinicWithThisVet = clinic.vets?.find(v => vet.id === v.id);

            if (clinicWithThisVet) {
                const receptionTimes = clinicWithThisVet.receptionTimes;
                
                const existingReceptionTime = receptionTimes?.find(time =>
                    time.startTime === startTime
                    && time.endTime === endTime
                    && time.day === day
                    && time.clinic.id === clinicId
                );

                if (existingReceptionTime) throw new BadRequestException([ErrorMessagesConstants.CLINIC_RECEPTION_TIME_ALREADY_EXISTS]);
                
                if (!this.checkIfClinicReceptionStartTimeIsLessThanEndTime(startTime, endTime))
                    throw new BadRequestException([ErrorMessagesConstants.CLINIC_RECEPTION_START_TIME_CANNOT_BE_GREATER_THAN_END_TIME]);
                
                if (await this.checkIfClinicReceptionTimesCollidateWithEachOther(createClinicReceptionTimeDto))
                    throw new BadRequestException([ErrorMessagesConstants.CLINIC_RECEPTION_TIMES_CANNOT_COLLIDATE_WITH_EACH_OTHER]);
                
                
                const newClinicReceptionTime = this.clinicsReceptionTimesRepository.create({
                    day,
                    endTime,
                    startTime,
                    vet,
                    clinic
                });

                vet.receptionTimes = vet.receptionTimes ? [...vet.receptionTimes, newClinicReceptionTime] : [newClinicReceptionTime];
                clinic.receptionTimes = clinic.receptionTimes ? [...clinic.receptionTimes, newClinicReceptionTime] : [newClinicReceptionTime];
                await this.clinicsReceptionTimesRepository.save(newClinicReceptionTime);
                await this.clinicsRepository.save(clinic);
                return newClinicReceptionTime;
            }
            else throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
        }
    }

    async findClinicReceptionTimeById(id: number): Promise<MedivetClinicsReceptionTime> {
        const clinicReceptionTime = await this.clinicsReceptionTimesRepository.findOne({ where: { id } });

        if (!clinicReceptionTime) throw new NotFoundException([ErrorMessagesConstants.CLINIC_RECEPTION_TIME_WITH_THIS_ID_DOES_NOT_EXIST]);
        return clinicReceptionTime;
    }

    async checkIfClinicReceptionTimesCollidateWithEachOther(createReceptionTimeDto: MedivietCreateClinicsReceptionTimeDto): Promise<boolean> {
        const { day, startTime, endTime } = createReceptionTimeDto;

        const receptionTimeForThisDay = await this.clinicsReceptionTimesRepository.find({ where: { day } });
        if (receptionTimeForThisDay.length === 0) return false;

        return receptionTimeForThisDay.some(time => {
            if (startTime > time.startTime && startTime < time.endTime) return true;
            if (endTime > time.startTime && endTime < time.endTime) return true;
            if (startTime < time.startTime && startTime !== time.startTime && endTime >= time.endTime) return true;
            if (startTime <= time.startTime && endTime > time.endTime && endTime !== time.endTime) return true;
            return false;
        });
    }

    checkIfClinicReceptionStartTimeIsLessThanEndTime(startTime: string, endTime: string): boolean {
        if (startTime === '00:00') startTime = "24:00";
        if (endTime === '00:00') endTime = "24:00";
        return startTime < endTime;
    }
};