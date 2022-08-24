import { envConfig } from "@/medivet-commons/configurations/env-config";
import { Address } from "@/medivet-commons/dto/address.dto";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import {  MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({ type: 'json', nullable: false })
    address: Address

}