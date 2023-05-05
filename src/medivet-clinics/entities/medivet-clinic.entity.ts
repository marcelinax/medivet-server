import { MedivetClinicToVetWithSpecializations } from "@/medivet-clinics/entities/medivet-clinic-to-vet-with-specializations.entity";
import { MedivetClinicsReceptionTime } from '@/medivet-clinics/entities/medivet-clinics-reception-time.entity';
import { AddressDto } from '@/medivet-commons/dto/address.dto';
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
    @OneToMany(() => MedivetClinicToVetWithSpecializations, ctv => ctv.clinic)
    vets: MedivetClinicToVetWithSpecializations[];

    @ApiProperty()
    @OneToMany(() => MedivetClinicsReceptionTime, time => time.clinic)
    receptionTimes: MedivetClinicsReceptionTime[];
}