import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { MedivetAnimalType } from "@/medivet-commons/enums/enums";

@Entity()
export class MedivetAnimalBreed {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({
      type: "enum",
      enum: MedivetAnimalType,
      nullable: false
  })
  type: MedivetAnimalType;
}
