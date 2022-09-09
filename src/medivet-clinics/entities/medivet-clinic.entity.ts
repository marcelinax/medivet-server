import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AddressDto } from '@/medivet-commons/dto/address.dto';
import { MedivetClinicsReceptionTime } from '@/medivet-clinics/entities/medivet-clinics-reception-time.entity';
import { MedivetClinicToVetWithSpecializations } from "@/medivet-clinics/entities/medivet-clinic-to-vet-with-specializations.entity";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

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
    @OneToMany(() => MedivetClinicToVetWithSpecializations, ctv => ctv.clinic)
    vets: MedivetClinicToVetWithSpecializations[];

    @ApiProperty()
    @OneToMany(() => MedivetClinicsReceptionTime, time => time.clinic)
    receptionTimes: MedivetClinicsReceptionTime[];

    @ApiProperty({type: () => MedivetUser})
    @ManyToOne(() => MedivetUser, user => user.createdClinics)
    creator: MedivetUser;
}