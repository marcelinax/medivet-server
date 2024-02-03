import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import {
    MedivetAppointmentStatus,
    MedivetOpinionSortingModeEnum,
    MedivetOpinionStatus
} from "@/medivet-commons/enums/enums";
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
    private usersService: MedivetUsersService,
    private appointmentService: MedivetAppointmentsService
    ) {
    }

    async createOpinion(user: MedivetUser, createOpinionDto: MedivetCreateOpinionDto): Promise<MedivetOpinion> {
        const { message, rate, vetId, appointmentId } = createOpinionDto;
        const appointment = await this.appointmentService.findAppointmentById(appointmentId, "opinion");

        await this.checkIfCanAddOpinionToAppointment(appointment);
        const possibleVet = await this.usersService.findOneById(vetId, "opinions,opinions.issuer");

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
                issuer: user,
                appointment,
                status: MedivetOpinionStatus.ACTIVE
            });
            possibleVet.opinions = possibleVet.opinions ? [ ...possibleVet.opinions, newOpinion ] : [ newOpinion ];
            await this.opinionsRepository.save(newOpinion);
            await this.usersService.saveUser(possibleVet);
            return newOpinion;
        }
    }

    async findAllOpinionsAssignedToVet(vetId: number, include?: string[]): Promise<MedivetOpinion[]> {
        const vet = await this.usersService.findOneById(vetId, "opinions,opinions.issuer");

        if (vet) {
            return this.opinionsRepository.find({
                where: {
                    vet: { id: vetId },
                    status: MedivetOpinionStatus.ACTIVE
                },
                relations: [ "issuer", ...(include || []) ]
            });
        }
    }

    async searchVetOpinions(vetId: number, searchOpinionDto: MedivetSearchOpinionDto): Promise<MedivetOpinion[]> {
        let opinions = await this.findAllOpinionsAssignedToVet(vetId, searchOpinionDto?.include?.split(",") || []);

        if (searchOpinionDto.sortingMode) {
            opinions = opinions.sort((a, b) => {
                switch (searchOpinionDto.sortingMode) {
                    case MedivetOpinionSortingModeEnum.NEWEST: {
                        return b.date.getTime() - a.date.getTime();
                    }
                    case MedivetOpinionSortingModeEnum.OLDEST:
                        return a.date.getTime() - b.date.getTime();
                    case MedivetOpinionSortingModeEnum.HIGHEST_RATE:
                        if (b.rate === a.rate) {
                            return b.date.getTime() - a.date.getTime();
                        }
                        return b.rate - a.rate;
                    case MedivetOpinionSortingModeEnum.LOWEST_RATE:
                        if (b.rate === a.rate) {
                            return b.date.getTime() - a.date.getTime();
                        }
                        return a.rate - b.rate;
                    default:
                        return b.date.getTime() - a.date.getTime();
                }
            });
        } else {
            opinions = opinions.sort((a, b) => {
                return b.date.getTime() - a.date.getTime();
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

    async findOpinionById(opinionId: number, include?: string): Promise<MedivetOpinion> {
        const opinion = await this.opinionsRepository.findOne({
            where: { id: opinionId },
            relations: include?.split(",") ?? []
        });

        if (!opinion) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.OPINION_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }

        return opinion;
    }

    async reportOpinion(opinionId: number, include?: string): Promise<MedivetOpinion> {
        const opinion = await this.findOpinionById(opinionId, include);

        if (opinion.status !== MedivetOpinionStatus.ACTIVE) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_REPORT_ALREADY_REPORTED_OR_REMOVED_OPINION,
                    property: "all"
                }
            ]);
        }

        opinion.status = MedivetOpinionStatus.REPORTED;
        await this.opinionsRepository.save(opinion);

        return opinion;
    }

    private async checkIfCanAddOpinionToAppointment(appointment: MedivetAppointment): Promise<void> {
        if (appointment.opinion) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.YOU_HAVE_ALREADY_ADDED_OPINION_TO_APPOINTMENT,
                    property: "all"
                }
            ]);
        }

        if (appointment.status !== MedivetAppointmentStatus.FINISHED) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_ADD_OPINION_TO_NOT_FINISHED_APPOINTMENT,
                    property: "all"
                }
            ]);
        }
    }
}
