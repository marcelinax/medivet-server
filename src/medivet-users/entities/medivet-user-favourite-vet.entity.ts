import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Entity()
export class MedivetUserFavouriteVet {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => MedivetUser, user => user.id)
  user: MedivetUser;

  @ApiProperty()
  @ManyToOne(() => MedivetUser, vet => vet.id)
  vet: MedivetUser;

  @ApiProperty()
  @Column({ nullable: false })
  isFavourite: boolean;
}
