import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAnimalBreed } from "@/medivet-animals/entities/medivet-animal-breed.entity";
import { MedivetAnimalCoatColor } from "@/medivet-animals/entities/medivet-animal-coat-color.entity";
import { MedivetAnimalType } from "@/medivet-animals/enums/medivet-animal-type.enum";
import { envConfig } from "@/medivet-commons/configurations/env-config";
import { MedivetGenderEnum, MedivetStatusEnum } from "@/medivet-commons/enums/enums";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

const env = envConfig();

@Entity()
export class MedivetAnimal {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty({ type: () => MedivetUser })
  @ManyToOne(() => MedivetUser, user => user.id)
  owner: MedivetUser;

  @ApiProperty()
  @Column({
      type: "enum",
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
  @ManyToOne(() => MedivetAnimalCoatColor, animalCoatColor => animalCoatColor.id)
  coatColor: MedivetAnimalCoatColor;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetGenderEnum,
      nullable: false
  })
  gender: MedivetGenderEnum;

  @ApiProperty()
  @Transform(({ value }) => value ? env.ROOT_URL + value : value)
  @Column({ default: "" })
  profilePhotoUrl: string;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetStatusEnum,
      default: MedivetStatusEnum.ACTIVE,
      nullable: false
  })
  status: MedivetStatusEnum;
}
