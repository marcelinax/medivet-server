import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    @ApiProperty()
    @OneToMany(() => MedivetUser, vet => vet.id)
    clinic: MedivetClinic;
}