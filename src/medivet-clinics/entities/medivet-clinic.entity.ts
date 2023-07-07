import { AddressDto } from '@/medivet-commons/dto/address.dto';
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedivetClinicAssignmentRequest } from './medivet-clinic-assignment-request.entity';

@Entity()
export class MedivetClinic {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false })
    name: string;

    @ApiProperty()
    @Column({ type: 'json', nullable: false })
    address: AddressDto;

    @ApiProperty()
    @Column({ nullable: false })
    phoneNumber: string;

    @ApiProperty()
    @ManyToMany(() => MedivetUser)
    @JoinTable({ name: 'medivet-bind-vet-clinics' })
    vets: MedivetUser[];

    @ApiProperty()
    @OneToMany(() => MedivetClinicAssignmentRequest, request => request.clinic)
    clinicAssignmentRequests: MedivetClinicAssignmentRequest[];
}