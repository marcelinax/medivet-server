import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { AddressDto } from '@/medivet-commons/dto/address.dto';
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
    @ManyToMany(() => MedivetUser)
    @JoinTable({name: 'medivet-bind-clinic-vets'})
    vets: MedivetUser[]
    
}