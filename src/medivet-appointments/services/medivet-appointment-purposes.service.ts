import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetAppointmentPurpose } from '@/medivet-appointments/entities/medivet-appointment-purpose.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateAppointmentPurposeDto } from "@/medivet-appointments/dto/medivet-create-appointment-purpose.dto";
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";

@Injectable()
export class MedivetAppointmentPurposesService {
    constructor(
        @InjectRepository(MedivetAppointmentPurpose) private appointmentPurposesRepository: Repository<MedivetAppointmentPurpose>,
        private vetSpecializationsService: MedivetVetSpecializationService
    ) { }
    
    async createAppointmentPurpose(
        vet: MedivetUser,
        createAppointmentPurposeDto: MedivetCreateAppointmentPurposeDto
    ): Promise<MedivetAppointmentPurpose> {
        const { clinicId, name, price, specializationId} = createAppointmentPurposeDto;
        const possibleSpecialization = await this.vetSpecializationsService.findVetSpecializationById(specializationId);

        if (possibleSpecialization) {
            if (!this.checkIfVetHasThisSpecialization(possibleSpecialization, vet))
                throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_IS_NOT_ASSIGNED_TO_THIS_VET]);
            
            if (!this.checkIfVetIsAssignedToThisClinic(clinicId, vet))
                throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
            
            if(this.checkIfVetAppointmentPurposeExists(vet.id, clinicId, name))
                throw new BadRequestException([ErrorMessagesConstants.APPOINTMENT_PURPOSE_ALREADY_EXISTS]);
            
            const clinic = vet.clinics.find(clinic => clinic.id === clinicId);
            
            const newAppointmentPurpose = this.appointmentPurposesRepository.create({
                clinic,
                vet,
                price,
                name,
            });

            await this.appointmentPurposesRepository.save(newAppointmentPurpose);
            return newAppointmentPurpose;
        }
    }

    async updateAppointmentPurpose(
        vet: MedivetUser,
        createAppointmentPurposeDto: MedivetCreateAppointmentPurposeDto
    ): Promise<MedivetAppointmentPurpose> {
        const { name, price, clinicId, specializationId } = createAppointmentPurposeDto;
        const appointmentPurpose = await this.findVetAppointmentPurpose(vet.id, clinicId, name);
        const possibleSpecialization = await this.vetSpecializationsService.findVetSpecializationById(specializationId);

        if (!appointmentPurpose) throw new NotFoundException([ErrorMessagesConstants.APPOINTMENT_PURPOSE_DOES_NOT_EXIST]);

        if (possibleSpecialization) {
            if (!this.checkIfVetHasThisSpecialization(possibleSpecialization, vet))
            throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_IS_NOT_ASSIGNED_TO_THIS_VET]);
            
        if (!this.checkIfVetIsAssignedToThisClinic(clinicId, vet))
            throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);

        appointmentPurpose.name = name;
        appointmentPurpose.price = price;

        await this.appointmentPurposesRepository.save(appointmentPurpose);
        return appointmentPurpose;
        }
    }

    async findAppointmentPurposeById(id: number): Promise<MedivetAppointmentPurpose> {
        const appointmentPurpose = await this.appointmentPurposesRepository.findOne({ where: { id } });

        if (!appointmentPurpose) throw new NotFoundException([ErrorMessagesConstants.APPOINTMENT_PURPOSE_DOES_NOT_EXIST]);
        return appointmentPurpose;
    }

    async findVetAppointmentPurpose(vetId: number, clinicId: number, name: string): Promise<MedivetAppointmentPurpose> {
        return this.appointmentPurposesRepository
            .findOne({ where: { vet: { id: vetId }, clinic: { id: clinicId }, name, }, relations: ['clinic', 'vet'] });
    }

    private checkIfVetHasThisSpecialization(specialization: MedivetVetSpecialization, vet: MedivetUser): boolean {
        const possibleSpecialization = vet.specializations.find(spec => spec.id === specialization.id);
        return !!possibleSpecialization;
    }

    private checkIfVetIsAssignedToThisClinic(clinicId: number, vet: MedivetUser): boolean {
        return !!vet.clinics.find(clinic => clinic.id === clinicId);
    }

    private checkIfVetAppointmentPurposeExists(vetId: number, clinicId: number, name: string): boolean {
        return !this.findVetAppointmentPurpose(vetId, clinicId, name);
    }

}