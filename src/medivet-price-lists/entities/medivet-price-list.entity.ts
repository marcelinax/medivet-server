import { ApiProperty } from "@nestjs/swagger";
import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetAppointmentPurpose } from "@/medivet-appointments/entities/medivet-appointment-purpose.entity";
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';

@Entity()
export class MedivetPriceList{
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ type: () => MedivetUser})
    @ManyToOne(() => MedivetUser)
    vet: MedivetUser;

    @ApiProperty({ type: () => MedivetClinic })
    @ManyToOne(() => MedivetClinic)
    clinic: MedivetClinic;

    @ApiProperty()
    @ManyToMany(() => MedivetAppointmentPurpose)
    @JoinTable({ name: 'medivet-bind-appointment-purpose-price-list' })
    purposes: MedivetAppointmentPurpose[];

    @ApiProperty({ type: () => MedivetVetSpecialization})
    @ManyToOne(() => MedivetVetSpecialization)
    specialization: MedivetVetSpecialization;
}