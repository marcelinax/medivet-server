import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetResetPasswordToken {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @ManyToOne(() => MedivetUser)
    user: MedivetUser;

    @ApiProperty()
    @Column({ nullable: false })
    token: string;

    @ApiProperty()
    @CreateDateColumn()
    genarateDate: Date;
}
