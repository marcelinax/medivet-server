import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedivetOpinion } from '@/medivet-opinions/entities/medivet-opinion.entity';
import { Repository } from 'typeorm';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetCreateOpinionDto } from '@/medivet-opinions/dto/medivet-create-opinion.dto';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetOpinionsService {
    constructor(
        @InjectRepository(MedivetOpinion) private opinionsRepository: Repository<MedivetOpinion>,
        private usersService: MedivetUsersService
    ) { }
    
    async createOpinion(user: MedivetUser, createOpinionDto: MedivetCreateOpinionDto): Promise<MedivetOpinion> {
        const { message, rate, vetId } = createOpinionDto;

        const  possibleVet = await this.usersService.findOneById(vetId);

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
}