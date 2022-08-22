import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';

@Entity()
export class MedivetAnimalBreed {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column({
        default: false
    })
    used: boolean;

    @ApiProperty()
    @ManyToOne(() => MedivetUser, user => user.id)
    user: MedivetUser;
}