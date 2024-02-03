import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetOpinionStatus } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetOpinion {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.opinions)
  vet: MedivetUser;

  @ApiProperty()
  @Column({ nullable: false })
  message: string;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  date: Date;

  @ApiProperty()
  @Column({ nullable: false })
  rate: number;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.opinions)
  issuer: MedivetUser;

  @ApiProperty({ type: () => MedivetAppointment })
  @OneToOne(() => MedivetAppointment, appointment => appointment.opinion)
  @JoinColumn({ name: "appointmentId" })
  appointment: MedivetAppointment;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetOpinionStatus,
      nullable: false
  })
  status: MedivetOpinionStatus;
}
