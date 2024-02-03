import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetOpinionStatus } from "@/medivet-commons/enums/enums";
import { MedivetOpinion } from "@/medivet-opinions/entities/medivet-opinion.entity";
import { MedivetOpinionsService } from "@/medivet-opinions/services/medivet-opinions.service";

@Injectable()
export class MedivetAdminOpinionsService {
    constructor(
    @InjectRepository(MedivetOpinion) private opinionsRepository: Repository<MedivetOpinion>,
    private opinionsService: MedivetOpinionsService
    ) {
    }

    async changeOpinionStatus(
        opinionId: number,
        status: MedivetOpinionStatus,
        include?: string
    ): Promise<MedivetOpinion> {
        const opinion = await this.opinionsService.findOpinionById(opinionId, include);

        opinion.status = status;
        await this.opinionsRepository.save(opinion);

        return opinion;
    }
}
