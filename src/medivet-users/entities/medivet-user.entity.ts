import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import {  MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedivetUser {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty()
    @Exclude()
    @Column()
    password: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @CreateDateColumn()
    birthDate: Date;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetUserRole,
    })
    role: MedivetUserRole;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetGender,
        default: MedivetGender.MALE
    })
    gender: MedivetGender;

    @ApiProperty()
    @Column({default: ''})
    phoneNumber: string;

    @ApiProperty()
    @Column({default: ''})
    profilePhotoUrl: string;
}