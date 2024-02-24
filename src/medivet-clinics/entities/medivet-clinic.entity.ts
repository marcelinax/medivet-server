import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { AddressCoordinates } from "@/medivet-commons/types";
import { MedivetPaymentMethod } from "@/medivet-payment-methods/entities/medivet-payment-method.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

import { MedivetClinicAssignmentRequest } from "./medivet-clinic-assignment-request.entity";

@Entity()
export class MedivetClinic {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({
      type: "json",
      nullable: false
  })
  address: AddressDto;

  @ApiProperty()
  @Column({ nullable: false })
  phoneNumber: string;

  @ApiProperty()
  @ManyToMany(() => MedivetUser)
  @JoinTable({ name: "medivet-bind-vet-clinics" })
  vets: MedivetUser[];

  @ApiProperty()
  @OneToMany(() => MedivetClinicAssignmentRequest, request => request.clinic)
  clinicAssignmentRequests: MedivetClinicAssignmentRequest[];

  @ApiProperty()
  @Column({
      type: "json",
      nullable: false
  })
  coordinates: AddressCoordinates;

  @ApiProperty()
  @ManyToMany(() => MedivetPaymentMethod)
  @JoinTable({ name: "medivet-bind-clinic-payment-methods", })
  paymentMethods: MedivetPaymentMethod[];
}
