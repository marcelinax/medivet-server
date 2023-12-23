import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAppointmentStatus } from "@/medivet-commons/enums/enums";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";

@Entity()
export class MedivetAppointment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
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
}
