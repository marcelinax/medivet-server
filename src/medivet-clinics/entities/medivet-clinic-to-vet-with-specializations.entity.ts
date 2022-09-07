import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';

@Entity() 
export class MedivetClinicToVetWithSpecializations {
    @PrimaryGeneratedColumn()
    clinicToVetSpecId: number

    @ManyToMany(() => MedivetVetSpecialization)
    @JoinTable({name: 'medivet-bind-clinic-vet-specializations'})
    specializations: MedivetVetSpecialization[];

    @ManyToOne(() => MedivetUser, (vet) => vet.clinics)
    vet: MedivetUser;

    @ManyToOne(() => MedivetClinic, (clinic) => clinic.vets)
    clinic: MedivetClinic;
}