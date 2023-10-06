import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicAssignmentRequestStatus } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetClinicAssignmentRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.clinicAssignmentRequest)
  user: MedivetUser;

  @ApiProperty({ type: () => MedivetClinic })
  @ManyToOne(() => MedivetClinic, clinic => clinic.clinicAssignmentRequests)
  clinic: MedivetClinic;

  @ApiProperty()
  @Column({
      nullable: false,
      type: "enum",
      enum: MedivetClinicAssignmentRequestStatus
  })
  status: MedivetClinicAssignmentRequestStatus;
}
