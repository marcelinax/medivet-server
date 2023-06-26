import { AddressDto } from '@/medivet-commons/dto/address.dto';
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({ nullable: false })
    phoneNumber: string;

    @ApiProperty()
    @ManyToMany(() => MedivetUser)
    vets: MedivetUser[];
}