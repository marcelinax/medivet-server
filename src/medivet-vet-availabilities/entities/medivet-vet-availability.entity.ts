import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { MedivetVetSpecialization } from "@/medivet-specializations/entities/medivet-vet-specialization.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedivetVetAvailability {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @ManyToOne(() => MedivetUser, user => user.id)
    user: MedivetUser;

    @ApiProperty()
    @ManyToOne(() => MedivetClinic, clinic => clinic.id)
    clinic: MedivetClinic;

    @ApiProperty()
    @ManyToOne(() => MedivetVetSpecialization, specialization => specialization.id)
    specialization: MedivetVetSpecialization;

    // @ApiProperty()
    // @Column({ nullable: false })
    // weekdays: string;

    // @ApiProperty()
    // @Column({ nullable: false })
    // : string;
}