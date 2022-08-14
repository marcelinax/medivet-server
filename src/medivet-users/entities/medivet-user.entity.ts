import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import {  MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedivetUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @CreateDateColumn()
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: MedivetUserRole,
    })
    role: MedivetUserRole;

    @Column({
        type: 'enum',
        enum: MedivetGender,
        default: MedivetGender.MALE
    })
    gender: MedivetGender;

    @Column({default: ''})
    phoneNumber: string;

    @Column({default: ''})
    profilePhotoUrl: string;
}