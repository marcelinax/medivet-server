import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@Entity()
export class MedivetOpinion {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({type: () => MedivetUser})
    @ManyToOne(() => MedivetUser, user => user.opinions)
    vet: MedivetUser;

    @ApiProperty()
    @Column({nullable: false})
    message: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: false })
    date: Date;

    @ApiProperty()
    @Column({ nullable: false })
    rate: number;

    @ApiProperty({ type: () => MedivetUser})
    @ManyToOne(() => MedivetUser, user => user.opinions)
    issuer: MedivetUser;
}