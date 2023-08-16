import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetUserDeleteLog {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @ManyToOne(() => MedivetUser)
    user: MedivetUser;

    @ApiProperty()
    @CreateDateColumn({ nullable: false })
    deletedDate: Date;
}
