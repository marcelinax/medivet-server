import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetVacationStatus } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetVacation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  from: Date;

  @ApiProperty()
  @Column({ nullable: false })
  to: Date;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.id)
  user: MedivetUser;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetVacationStatus,
      nullable: false
  })
  status: MedivetVacationStatus;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  createdAt: Date;
}
