import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetClinicToVetWithSpecializations } from '@/medivet-clinics/entities/medivet-clinic-to-vet-with-specializations.entity';
import { Repository } from 'typeorm';
import { MedivetCreateClinicToVetWithSpecializationsDto } from '@/medivet-clinics/dto/medivet-create-clinic-to-vet-with-specializations.dto';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetVetSpecialization } from "@/medivet-users/entities/medivet-vet-specialization.entity";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@Injectable()
export class MedivetClinicToVetWithSpecializationsService {
    constructor(
        @InjectRepository(MedivetClinicToVetWithSpecializations) private clinicToVetWithSpecializationsRepository: Repository<MedivetClinicToVetWithSpecializations>,
        private usersService: MedivetUsersService,
        @Inject(forwardRef(() => MedivetClinicsService)) 
        private clinicsService: MedivetClinicsService
    ) { }
    
    async createRelationshipBetweenClinicAndVetWithSpecializations(createClinicToVetWithSpecializationsDto: MedivetCreateClinicToVetWithSpecializationsDto)
        : Promise<MedivetClinicToVetWithSpecializations> {
        const { clinicId, specializationIds, vetId } = createClinicToVetWithSpecializationsDto;

        const vet = await this.usersService.findVetById(vetId);
        const clinic = await this.clinicsService.findClinicById(clinicId);

        if (vet && clinic) {
            const isAlreadyThisClinicAssignedToVet = !!vet.clinics.find(c => c.clinic.id === clinic.id);
            if (isAlreadyThisClinicAssignedToVet) {
                throw new BadRequestException([ErrorMessagesConstants.VET_IS_ALREADY_ASSIGNED_TO_THIS_VET_CLINIC]);
            }

            const specializations = this.getAllVetSpecializationsToAssign(vet, specializationIds);

            const newClinicObj = this.clinicToVetWithSpecializationsRepository.create({
                vet,
                clinic,
                specializations
            });

            await this.clinicToVetWithSpecializationsRepository.save(newClinicObj);
            return newClinicObj;
        }
    }

    private getAllVetSpecializationsToAssign(vet: MedivetUser, specializationIds: number[]): MedivetVetSpecialization[] {
        return specializationIds.map( (specId) => {
            if (!this.checkIfVetHasThisSpecialization(specId, vet))
                throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_IS_NOT_ASSIGNED_TO_THIS_VET]);
            
            const specialization = vet.specializations.find(spec => spec.id === specId);
            if (specialization) return specialization;
        });

    }

    private checkIfVetHasThisSpecialization(specializationId: number, vet: MedivetUser): boolean {
        return !!vet.specializations.find(spec => spec.id === specializationId);
    }
}