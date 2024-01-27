import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";

@Entity()
export class MedivetAppointmentDiary {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetAppointment })
  @OneToOne(() => MedivetAppointment, appointment => appointment.diary)
  appointment: MedivetAppointment;

  @ApiProperty()
  @Column({ nullable: false })
  reason: string;

  @ApiProperty()
  @Column({ nullable: false })
  description: string;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  date: Date;
}
