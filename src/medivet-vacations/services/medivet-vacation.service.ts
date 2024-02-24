import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Between, Repository } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetAppointmentStatus, MedivetVacationStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetCreateVacationDto } from "@/medivet-vacations/dto/medivet-create-vacation.dto";
import { MedivetVacation } from "@/medivet-vacations/entities/medivet-vacation.entity";

@Injectable()
export class MedivetVacationService {
    constructor(
    @InjectRepository(MedivetVacation) private vacationRepository: Repository<MedivetVacation>,
    @InjectRepository(MedivetAppointment) private appointmentRepository: Repository<MedivetAppointment>
    ) {
    }

    async createVacation(
        user: MedivetUser,
        createVacationDto: MedivetCreateVacationDto
    ): Promise<MedivetVacation> {
        const { to, from } = createVacationDto;
        this.checkIfVacationDatesAreProper(from, to);
        await this.checkIfVacationForUserInDateRangeExists(user, from, to);

        const newVacation = this.vacationRepository.create({
            from,
            to,
            user,
            status: MedivetVacationStatus.ACTIVE
        });

        await this.vacationRepository.save(newVacation);

        const appointmentsToBeCancelled = await this.getAppointmentsToBeCancelled(
            from,
            to,
            user
        );
        for (const appointment of appointmentsToBeCancelled) {
            appointment.status = MedivetAppointmentStatus.CANCELLED;
            await this.appointmentRepository.save(appointment);
        }

        return newVacation;
    }

    async searchVacationsForUser(
        user: MedivetUser,
        paginationDto: OffsetPaginationDto,
        status?: MedivetVacationStatus
    ): Promise<MedivetVacation[]> {
        let vacations = await this.findAllVacationsForUser(user.id);

        if (status) {
            vacations = vacations.filter(vacation => vacation.status === status);
        }

        return paginateData(vacations, paginationDto);
    }

    async getActiveVetVacations(vetId: number): Promise<MedivetVacation[]> {
        const vacations = await this.findAllVacationsForUser(vetId);
        return vacations.filter(vacation => vacation.status === MedivetVacationStatus.ACTIVE);
    }

    async findVacationById(vacationId: number, user: MedivetUser): Promise<MedivetVacation> {
        const vacation = await this.vacationRepository.findOne({
            where: {
                user: { id: user.id },
                id: vacationId
            },
            relations: [ "user" ]
        });

        if (!vacation) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.VACATION_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }

        return vacation;
    }

    async cancelVacation(user: MedivetUser, vacationId: number): Promise<MedivetVacation> {
        const vacation = await this.findVacationById(vacationId, user);

        if (vacation.status !== MedivetVacationStatus.ACTIVE) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CANCEL_VACATION_IN_DIFFERENT_STATUS_THAN_ACTIVE,
                    property: "all"
                }
            ]);
        }

        vacation.status = MedivetVacationStatus.CANCELLED;
        await this.vacationRepository.save(vacation);

        return vacation;
    }

    async updateVacation(
        user: MedivetUser,
        vacationId: number,
        updateVacationDto: MedivetCreateVacationDto
    ): Promise<MedivetVacation> {
        const vacation = await this.findVacationById(vacationId, user);
        const { to, from } = updateVacationDto;

        await this.checkIfVacationForUserInDateRangeExists(user, from, to);

        vacation.from = from;
        vacation.to = to;
        await this.vacationRepository.save(vacation);

        const appointmentsToBeCancelled = await this.getAppointmentsToBeCancelled(
            from,
            to,
            user
        );
        for (const appointment of appointmentsToBeCancelled) {
            appointment.status = MedivetAppointmentStatus.CANCELLED;
            await this.appointmentRepository.save(appointment);
        }

        return vacation;
    }

    async getAppointmentsToBeCancelled(
        dateFrom: Date,
        dateTo: Date,
        vet: MedivetUser
    ): Promise<MedivetAppointment[]> {
        return this.appointmentRepository.find({
            where: {
                medicalService: { user: { id: vet.id } },
                date: Between(dateFrom, dateTo)
            },
            relations: [ "medicalService", "medicalService.user" ]
        });

    }

    async findAllVacationsForUser(userId: number, include?: string): Promise<MedivetVacation[]> {
        const relations = include ? [ ...include.split(","), "user" ] : [ "user" ];
        return this.vacationRepository.find({
            where: { user: { id: userId }, },
            relations
        });
    }

    private async checkIfVacationForUserInDateRangeExists(
        user: MedivetUser,
        dateFrom: Date,
        dateTo: Date
    ): Promise<void> {
        const userVacations = await this.findAllVacationsForUser(user.id);

        // 1. 13-14 2. 12-15
        // 2. 13-16 2. 14 -17
        // 3. 13-16 2.12-14
        // 4. 13-15 2. 12-14
        const conflictingVacation = userVacations.find(
            userVacation => moment(dateFrom).isBetween(userVacation.from, userVacation.to) ||
        moment(dateTo).isBetween(userVacation.from, userVacation.to)
        );

        if (conflictingVacation) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_TAKE_VACATION_BETWEEN_ANOTHER_ONE,
                    property: "all"
                }
            ]);
        }
    }

    private checkIfVacationDatesAreProper(
        dateFrom: Date,
        dateTo: Date
    ): void {
        if (moment(dateFrom).isAfter(dateTo)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.DATE_FROM_CANNOT_BE_LATER_THAN_DATE_TO,
                    property: "from"
                }
            ]);
        }
    }
}
