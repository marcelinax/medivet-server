import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAppointmentStatus } from "@/medivet-commons/enums/enums";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";

@Entity()
export class MedivetAppointment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetAnimal })
  @ManyToOne(() => MedivetAnimal, animal => animal.id)
  animal: MedivetAnimal;

  @ApiProperty()
  @ManyToOne(() => MedivetVetProvidedMedicalService, medicalService => medicalService.id)
  medicalService: MedivetVetProvidedMedicalService;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  date: Date;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetAppointmentStatus,
      nullable: false
  })
  status: MedivetAppointmentStatus;

  @ApiProperty({ type: () => MedivetOpinion })
  @OneToOne(() => MedivetOpinion, opinion => opinion.appointment, { eager: true })
  opinion: MedivetOpinion;
}
