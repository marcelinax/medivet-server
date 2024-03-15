import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetMessageStatus } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetMessage {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => MedivetUser, user => user.receivedMessages)
  receiver: MedivetUser;

  @ApiProperty()
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
}
