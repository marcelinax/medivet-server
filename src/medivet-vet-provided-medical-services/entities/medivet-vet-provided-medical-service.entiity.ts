import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetVetProvidedMedicalService {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @ManyToOne(() => MedivetUser, user => user.id)
    user: MedivetUser;

    @ApiProperty()
    @ManyToOne(() => MedivetVetSpecializationMedicalService, medicalService => medicalService.id)
    medicalService: MedivetVetSpecializationMedicalService;

    @ApiProperty()
    @ManyToOne(() => MedivetClinic, clinic => clinic.id)
    clinic: MedivetClinic;

    @ApiProperty()
    @Column({ nullable: false })
    price: number;

    @ApiProperty()
    @Column({ nullable: false })
    duration: number;
}
