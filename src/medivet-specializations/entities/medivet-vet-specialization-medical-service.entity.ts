import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";

@Entity()
export class MedivetVetSpecializationMedicalService {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({
        nullable: false,
        unique: true
    })
    name: string;

    @ApiProperty()
    @ManyToMany(() => MedivetVetSpecialization)
    @JoinTable({ name: "medivet-bind-medical-service-specializations" })
    specializations: MedivetVetSpecialization[];
}
