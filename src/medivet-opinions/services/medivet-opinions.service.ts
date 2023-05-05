import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { MedivetCreateOpinionDto } from '@/medivet-opinions/dto/medivet-create-opinion.dto';
import { MedivetSearchOpinionDto } from "@/medivet-opinions/dto/medivet-search-opinion.dto";
import { MedivetOpinion } from '@/medivet-opinions/entities/medivet-opinion.entity';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class MedivetOpinionsService {
    constructor(
        @InjectRepository(MedivetOpinion) private opinionsRepository: Repository<MedivetOpinion>,
        private usersService: MedivetUsersService
    ) { }

    async createOpinion(user: MedivetUser, createOpinionDto: MedivetCreateOpinionDto): Promise<MedivetOpinion> {
        const { message, rate, vetId } = createOpinionDto;

        const possibleVet = await this.usersService.findOneById(vetId, ['opinions,opinions.issuer']);

        if (possibleVet) {
            if (user.id === possibleVet.id) throw new BadRequestException([ErrorMessagesConstants.VET_CANNOT_GIVE_YOURSELF_OPINION]);
            if (possibleVet.role !== MedivetUserRole.VET) throw new BadRequestException([ErrorMessagesConstants.OPINION_CAN_ONLY_BE_GIVEN_TO_VET]);

            const newOpinion = this.opinionsRepository.create({
                date: new Date(),
                message,
                rate,
                vet: possibleVet,
                issuer: user
            });
            possibleVet.opinions = possibleVet.opinions ? [...possibleVet.opinions, newOpinion] : [newOpinion];
            await this.opinionsRepository.save(newOpinion);
            await this.usersService.saveUser(possibleVet);
            return newOpinion;
        }
    }

    async findAllOpinionsAssignedToVet(vetId: number): Promise<MedivetOpinion[]> {
        const vet = await this.usersService.findOneById(vetId, ['optinions,opinions.issuer']);

        if (vet) {
            return this.opinionsRepository.find({ where: { vet: { id: vetId } }, relations: ['issuer'] });
        }
    }

    async searchVetOpinions(vetId: number, searchOpinionDto: MedivetSearchOpinionDto): Promise<MedivetOpinion[]> {
        let opinions = await this.findAllOpinionsAssignedToVet(vetId);

        if (searchOpinionDto.sortingMode) {
            opinions = opinions.sort((a, b) => {
                switch (searchOpinionDto.sortingMode) {
                    case MedivetSortingModeEnum.NEWEST:
                        return b.date.getTime() - a.date.getTime();
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
        };

        const pageSize = searchOpinionDto.pageSize || 10;
        const offset = searchOpinionDto.offset || 0;

        return this.paginateOpinions(pageSize, offset, opinions);
    }

    private paginateOpinions(pageSize: number, offset: number, opinions: MedivetOpinion[]): MedivetOpinion[] {
        return opinions.filter((_, index) => index >= offset && index < pageSize + offset);
    }
}