import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";

@Entity()
export class MedivetVetSpecializationMedicalService {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false, })
  name: string;

  @ApiProperty()
  @ManyToOne(() => MedivetVetSpecialization, specialization => specialization.id)
  specialization: MedivetVetSpecialization;
}
