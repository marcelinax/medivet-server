import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedivetAnimalType } from "@/medivet-animals/enums/medivet-animal-type.enum";
import { MedivetGender } from "@/medivet-commons/enums/medivet-gender.enum";
import { Transform } from "class-transformer";
import { envConfig } from "@/medivet-commons/configurations/env-config";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

const env = envConfig();

@Entity()
export class MedivetAnimal {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @ManyToOne(() => MedivetUser, user => user.id)
    owner: MedivetUser;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetAnimalType
    })
    type: MedivetAnimalType;

    @ApiProperty()
    @CreateDateColumn()
    birthDate: Date;

    @ApiProperty()
    @Column()
    breed: string;

    @ApiProperty()
    @Column({default: ''})
    coatColor: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MedivetGender
    })
    gender: MedivetGender;

    @ApiProperty()
    @Transform(({value}) => value ? env.ROOT_URL + value : value)
    @Column({default: ''})
    profilePhotoUrl: string;
}