import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetClinicAssignmentRequest } from "@/medivet-clinics/entities/medivet-clinic-assignment-request.entity";
import { envConfig } from "@/medivet-commons/configurations/env-config";
import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";

const env = envConfig();

@Entity()
export class MedivetUser {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  email: string;

  @ApiProperty()
  @Exclude()
  @Column({ nullable: false })
  password: string;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @CreateDateColumn({ nullable: false })
  birthDate: Date;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetUserRole,
      nullable: false
  })
  role: MedivetUserRole;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetGenderEnum,
      default: MedivetGenderEnum.MALE,
      nullable: false
  })
  gender: MedivetGenderEnum;

  @ApiProperty()
  @Column({ default: "" })
  phoneNumber: string;

  @ApiProperty()
  @Transform(({ value }) => value ? env.ROOT_URL + value : value)
  @Column({ default: "" })
  profilePhotoUrl: string;

  @ApiProperty()
  @Column({
      type: "json",
      nullable: true
  })
  address: AddressDto;

  @ApiProperty()
  @ManyToMany(() => MedivetVetSpecialization)
  @JoinTable({ name: "medivet-bind-vet-specializations" })
  specializations: MedivetVetSpecialization[];

  @ApiProperty()
  @ManyToMany(() => MedivetClinic)
  @JoinTable({ name: "medivet-bind-vet-clinics" })
  clinics: MedivetClinic[];

  @ApiProperty()
  @OneToMany(() => MedivetClinicAssignmentRequest, request => request.user)
  clinicAssignmentRequest: MedivetClinicAssignmentRequest[];

  @ApiProperty({ type: () => MedivetOpinion })
  @OneToMany(() => MedivetOpinion, opinion => opinion.vet)
  opinions: MedivetOpinion[];

  @ApiProperty({ type: () => MedivetVetAvailability })
  @OneToMany(() => MedivetVetAvailability, availability => availability.user)
  vetAvailabilities: MedivetVetAvailability[];
}
