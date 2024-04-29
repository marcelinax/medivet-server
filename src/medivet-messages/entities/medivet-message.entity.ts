import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetMessage {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.receivedMessages)
  receiver: MedivetUser;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.sentMessages)
  issuer: MedivetUser;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetMessageStatus,
      nullable: false
  })
  receiverStatus: MedivetMessageStatus;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetMessageStatus,
      nullable: false
  })
  issuerStatus: MedivetMessageStatus;

  @ApiProperty()
  @Column({ nullable: false })
  message: string;

  @ApiProperty()
  @Column({ nullable: false })
  read: boolean;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  lastUpdate: Date;
}
