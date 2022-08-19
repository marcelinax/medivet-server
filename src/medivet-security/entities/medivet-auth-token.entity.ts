import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { Exclude } from "class-transformer";

@Entity()
export class MedivetAuthToken {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @ManyToOne(() => MedivetUser)
    user: MedivetUser;

    @Exclude()
    @Column({ nullable: false })
    token: string;

    @ApiProperty()
    @CreateDateColumn()
    lastUse: Date;

    @ApiProperty()
    @Column({ default: true })
    active: boolean;
}