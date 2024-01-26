import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetVetAvailabilityDay } from "@/medivet-commons/enums/enums";
import { MedivetVetProvidedMedicalService } from "@/medivet-vet-provided-medical-services/entities/medivet-vet-provided-medical-service.entity";

@Entity()
export class MedivetAvailableDate {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => MedivetVetProvidedMedicalService, medicalService => medicalService.id)
  medicalService: MedivetVetProvidedMedicalService;

  @ApiProperty()
  @Column({
      nullable: false,
      enum: MedivetVetAvailabilityDay,
      type: "enum"
  })
  day: MedivetVetAvailabilityDay;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  date: Date;
}
