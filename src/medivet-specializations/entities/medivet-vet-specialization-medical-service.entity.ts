import { MedivetVetSpecialization } from '@/medivet-specializations/entities/medivet-vet-specialization.entity';
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedivetVetSpecializationMedicalService {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false, unique: true })
    name: string;

    @ApiProperty()
    @ManyToMany(() => MedivetVetSpecialization)
    @JoinTable({ name: 'medivet-bind-medical-service-specializations' })
    specializations: MedivetVetSpecialization[];
}