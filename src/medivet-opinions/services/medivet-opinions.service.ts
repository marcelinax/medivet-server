import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetCreateOpinionDto } from "@/medivet-opinions/dto/medivet-create-opinion.dto";
import { MedivetSearchOpinionDto } from "@/medivet-opinions/dto/medivet-search-opinion.dto";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetOpinionsService {
    constructor(
    @InjectRepository(MedivetOpinion) private opinionsRepository: Repository<MedivetOpinion>,
    private usersService: MedivetUsersService
    ) {
    }

    async createOpinion(user: MedivetUser, createOpinionDto: MedivetCreateOpinionDto): Promise<MedivetOpinion> {
        const { message, rate, vetId } = createOpinionDto;

        const possibleVet = await this.usersService.findOneById(vetId, [ "opinions", "opinions.issuer" ]);

        if (possibleVet) {
            if (user.id === possibleVet.id) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.VET_CANNOT_GIVE_YOURSELF_OPINION,
                        property: "all"
                    }
                ]);
            }
            if (possibleVet.role !== MedivetUserRole.VET) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.OPINION_CAN_ONLY_BE_GIVEN_TO_VET,
                        property: "all"
                    }
                ]);
            }

            const newOpinion = this.opinionsRepository.create({
                date: new Date(),
                message,
                rate,
                vet: possibleVet,
                issuer: user
            });
            possibleVet.opinions = possibleVet.opinions ? [ ...possibleVet.opinions, newOpinion ] : [ newOpinion ];
            await this.opinionsRepository.save(newOpinion);
            await this.usersService.saveUser(possibleVet);
            return newOpinion;
        }
    }

    async findAllOpinionsAssignedToVet(vetId: number): Promise<MedivetOpinion[]> {
        const vet = await this.usersService.findOneById(vetId, [ "opinions", "opinions.issuer" ]);

        if (vet) {
            return this.opinionsRepository.find({
                where: { vet: { id: vetId } },
                relations: [ "issuer" ]
            });
        }
    }

    async searchVetOpinions(vetId: number, searchOpinionDto: MedivetSearchOpinionDto): Promise<MedivetOpinion[]> {
        let opinions = await this.findAllOpinionsAssignedToVet(vetId);

        if (searchOpinionDto.sortingMode) {
            opinions = opinions.sort((a, b) => {
                switch (searchOpinionDto.sortingMode) {
                    case MedivetSortingModeEnum.NEWEST: {
                        return b.date.getTime() - a.date.getTime();
                    }
                    case MedivetSortingModeEnum.OLDEST:
                        return a.date.getTime() - b.date.getTime();
                    case MedivetSortingModeEnum.HIGHEST_RATE:
                        if (b.rate === a.rate) {
                            return b.date.getTime() - a.date.getTime();
                        }
                        return b.rate - a.rate;
                    case MedivetSortingModeEnum.LOWEST_RATE:
                        if (b.rate === a.rate) {
                            return b.date.getTime() - a.date.getTime();
                        }
                        return a.rate - b.rate;
                    default:
                        return b.date.getTime() - a.date.getTime();
                }
            });
        }

        return paginateData(opinions, {
            pageSize: searchOpinionDto.pageSize,
            offset: searchOpinionDto.offset
        });
    }

    async getVetOpinionsTotalAmount(vetId: number): Promise<number> {
        const opinions = await this.findAllOpinionsAssignedToVet(vetId);
        return opinions.length;
    }
}
