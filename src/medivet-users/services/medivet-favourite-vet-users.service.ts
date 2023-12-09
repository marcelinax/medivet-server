import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserFavouriteVet } from "@/medivet-users/entities/medivet-user-favourite-vet.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetFavouriteVetUsersService {
    constructor(
    @InjectRepository(MedivetUserFavouriteVet) private userFavouriteVetRepository: Repository<MedivetUserFavouriteVet>,
    private usersService: MedivetUsersService
    ) {
    }

    async addVetToFavourites(user: MedivetUser, vetId: number): Promise<OkMessageDto> {
        const vet = await this.usersService.findVetById(vetId);
        const vetInFavourites = await this.userFavouriteVetRepository.findOne({
            where: {
                user: { id: user.id },
                vet: { id: vet.id },
            },
            relations: [ "user", "vet" ]
        });

        if (vetInFavourites) {
            if (!vetInFavourites.isFavourite) {
                vetInFavourites.isFavourite = true;
                await this.userFavouriteVetRepository.save(vetInFavourites);
            }
        } else {
            const newFavouredVet = {
                user,
                vet,
                isFavourite: true
            };
            await this.userFavouriteVetRepository.save(newFavouredVet);
        }

        return { message: SuccessMessageConstants.VET_HAS_BEEN_ADDED_TO_FAVOURITES_SUCCESSFULLY };
    }

    async removeVetFromFavourites(vetId: number, user: MedivetUser): Promise<OkMessageDto> {
        const vet = await this.usersService.findVetById(vetId);
        const vetInFavourites = await this.userFavouriteVetRepository.findOne({
            where: {
                user: { id: user.id },
                vet: { id: vet.id },
            },
            relations: [ "user", "vet" ]
        });

        if (!vetInFavourites) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_REMOVE_VET_FROM_FAVOURITES_WHO_WAS_NOT_FAVOURED,
                    property: "all"
                }
            ]);
        } else {
            vetInFavourites.isFavourite = false;
            await this.userFavouriteVetRepository.save(vetInFavourites);
        }

        return { message: SuccessMessageConstants.VET_HAS_BEEN_REMOVED_TO_FAVOURITES_SUCCESSFULLY };
    }

    async isVetInUserFavourites(vetId: number, user: MedivetUser): Promise<boolean> {
        const vetInFavourites = await this.userFavouriteVetRepository.findOne({
            where: {
                user: { id: user.id },
                vet: { id: vetId },
            },
            relations: [ "user", "vet" ]
        });

        return !!vetInFavourites;
    }
}
