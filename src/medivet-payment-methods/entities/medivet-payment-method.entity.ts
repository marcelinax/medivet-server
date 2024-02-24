import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { MedivetPaymentMethodStatus } from "@/medivet-commons/enums/enums";

@Entity()
export class MedivetPaymentMethod {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetPaymentMethodStatus,
      default: MedivetPaymentMethodStatus.ACTIVE,
      nullable: false
  })
  status: MedivetPaymentMethodStatus;
}
