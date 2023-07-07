import { MedivetVetAvailabilityDay } from "@/medivet-commons/enums/medivet-vet-availability.enums";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MedivetVetAvailabilityReceptionHour {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false, enum: MedivetVetAvailabilityDay, type: 'enum' })
    day: MedivetVetAvailabilityDay;

    @ApiProperty()
    @Column({ nullable: false, type: 'time' })
    hourFrom: string;

    @ApiProperty()
    @Column({ nullable: false, type: 'time' })
    hourTo: string;

    @ApiProperty({ type: () => MedivetVetAvailability })
    @ManyToOne(() => MedivetVetAvailability, vetAvailability => vetAvailability.receptionHours)
    vetAvailability: MedivetVetAvailability;
}