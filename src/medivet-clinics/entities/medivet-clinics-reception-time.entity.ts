import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@Entity()
export class MedivetClinicsReceptionTime {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false })
    startTime: string;
    
    @ApiProperty()
    @Column({ nullable: false })
    endTime: string;

    @ApiProperty()
    @Column({ nullable: false })
    day: string;

    @ApiProperty({type: () => MedivetClinic})
    @ManyToOne(() => MedivetClinic, clinic => clinic.receptionTimes)
    clinic: MedivetClinic;

    @ApiProperty({type: () => MedivetUser})
    @ManyToOne(() => MedivetUser, vet => vet.receptionTimes)
    vet: MedivetUser;
}