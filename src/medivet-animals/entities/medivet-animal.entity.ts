import { MedivetAnimalBreed } from '@/medivet-animals/entities/medivet-animal-breed.entity';
import { MedivetAnimalType } from "@/medivet-animals/enums/medivet-animal-type.enum";
import { envConfig } from "@/medivet-commons/configurations/env-config";
import { MedivetGenderEnum } from "@/medivet-commons/enums/medivet-gender.enum";
import { MedivetStatusEnum } from "@/medivet-commons/enums/medivet-status.enum";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

const env = envConfig();

@Entity()
export class MedivetAnimal {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: false })
    name: string;

    @ApiProperty()
    @ManyToOne(() => MedivetUser, user => user.id)
    owner: MedivetUser;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetAnimalType,
        nullable: false
    })
    type: MedivetAnimalType;

    @ApiProperty()
    @CreateDateColumn({ nullable: false })
    birthDate: Date;

    @ApiProperty()
    @ManyToOne(() => MedivetAnimalBreed, animalBreed => animalBreed.id)
    breed: MedivetAnimalBreed;

    @ApiProperty()
    @Column({ default: '' })
    coatColor: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetGenderEnum,
        nullable: false
    })
    gender: MedivetGenderEnum;

    @ApiProperty()
    @Transform(({ value }) => value ? env.ROOT_URL + value : value)
    @Column({ default: '' })
    profilePhotoUrl: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetStatusEnum,
        default: MedivetStatusEnum.ACTIVE,
        nullable: false
    })
    status: MedivetStatusEnum;
}