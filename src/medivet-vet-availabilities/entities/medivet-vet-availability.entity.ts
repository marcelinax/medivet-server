import { ApiProperty } from "@nestjs/swagger";
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetVetAvailabilityReceptionHour } from "@/medivet-vet-availabilities/entities/medivet-vet-availability-reception-hour.entity";

@Entity()
export class MedivetVetAvailability {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.id)
  user: MedivetUser;

  @ApiProperty()
  @ManyToOne(() => MedivetClinic, clinic => clinic.id)
  clinic: MedivetClinic;

  @ApiProperty()
  @ManyToOne(() => MedivetVetSpecialization, specialization => specialization.id)
  specialization: MedivetVetSpecialization;

  @ApiProperty()
  @OneToMany(() => MedivetVetAvailabilityReceptionHour, receptionHour => receptionHour.vetAvailability, { cascade: true, })
  receptionHours: MedivetVetAvailabilityReceptionHour[];
}
