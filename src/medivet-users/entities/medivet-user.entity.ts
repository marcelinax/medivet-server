import { envConfig } from "@/medivet-commons/configurations/env-config";
import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import {  MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedivetVetSpecialization } from '@/medivet-users/entities/medivet-vet-specialization.entity';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { MedivetClinicsReceptionTime } from "@/medivet-clinics/entities/medivet-clinics-reception-time.entity";
import { MedivetOpinion } from '@/medivet-opinions/entities/medivet-opinion.entity';

const env = envConfig();

@Entity()
export class MedivetUser {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({nullable: false})
    email: string;

    @ApiProperty()
    @Exclude()
    @Column({nullable: false})
    password: string;

    @ApiProperty()
    @Column({nullable: false})
    name: string;

    @ApiProperty()
    @CreateDateColumn({nullable: false})
    birthDate: Date;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetUserRole,
        nullable: false
    })
    role: MedivetUserRole;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetGenderEnum,
        default: MedivetGenderEnum.MALE,
        nullable: false
    })
    gender: MedivetGenderEnum;

    @ApiProperty()
    @Column({default: ''})
    phoneNumber: string;

    @ApiProperty()
    @Transform(({value}) => value ? env.ROOT_URL + value : value)
    @Column({default: ''})
    profilePhotoUrl: string;

    @ApiProperty()
    @Column({ type: 'json', nullable: true })
    address: AddressDto;

    @ApiProperty()
    @ManyToMany(() => MedivetVetSpecialization)
    @JoinTable({name: 'medivet-bind-vet-specializations'})
    specializations: MedivetVetSpecialization[];

    @ApiProperty()
    @ManyToMany(() => MedivetClinic)
    @JoinTable({ name: 'medivet-bind-clinic-vets' })
    clinics: MedivetClinic[];

    @ApiProperty()
    @OneToMany(() => MedivetClinicsReceptionTime, time => time.vet)
    receptionTimes: MedivetClinicsReceptionTime[];

    @ApiProperty({type: () => MedivetOpinion})
    @OneToMany(() => MedivetOpinion, opinion => opinion.vet)
    opinions: MedivetOpinion[];
}