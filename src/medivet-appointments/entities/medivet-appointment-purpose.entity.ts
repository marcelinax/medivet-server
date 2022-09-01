import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';

@Entity()
export class MedivetAppointmentPurpose {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false })
    name: string;

    @ApiProperty()
    @Column({ nullable: false })
    price: number;

    @ApiProperty({ type: () => MedivetUser})
    @ManyToOne(() => MedivetUser)
    vet: MedivetUser;

    @ApiProperty({ type: () => MedivetClinic})
    @ManyToOne(() => MedivetClinic)
    clinic: MedivetClinic;
}