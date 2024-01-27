import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment/moment";
import { Repository } from "typeorm";

import { MedivetCreateAppointmentDiaryDto } from "@/medivet-appointments/dto/medivet-create-appointment-diary.dto";
import { MedivetSearchAppointmentDiaryDto } from "@/medivet-appointments/dto/medivet-search-appointment-diary.dto";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAppointmentDiary } from "@/medivet-appointments/entities/medivet-appointment-diary.entity";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { paginateData } from "@/medivet-commons/utils";

@Injectable()
export class MedivetAppointmentDiariesService {
    constructor(
    @InjectRepository(MedivetAppointmentDiary) private appointmentDiaryRepository: Repository<MedivetAppointmentDiary>,
    private appointmentsService: MedivetAppointmentsService
    ) {
    }

    async createAppointmentDiary(
        createAppointmentDiaryDto: MedivetCreateAppointmentDiaryDto
    ): Promise<MedivetAppointmentDiary> {
        const { reason, appointmentId, description } = createAppointmentDiaryDto;

        await this.checkIfAppointmentDiaryIsAlreadyCreatedForAppointment(appointmentId);

        const appointment = await this.appointmentsService.findAppointmentById(
            appointmentId,
            "medicalService,medicalService.user,medicalService.clinic,animal"
        );

        this.checkIfCanAddAppointmentDiaryToAppointment(appointment);

        const diary = this.appointmentDiaryRepository.create({
            appointment,
            reason,
            description
        });

        await this.appointmentDiaryRepository.save(diary);

        return diary;
    }

    async findAppointmentDiaryById(
        id: number,
        include?: string
    ): Promise<MedivetAppointmentDiary> {
        const diary = await this.appointmentDiaryRepository.findOne({
            where: { id },
            relations: include?.split(",") ?? []
        });

        if (!diary) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.APPOINTMENT_DIARY_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }

        return diary;
    }

    async searchAppointmentDiariesForAnimal(
        animalId: number,
        searchAppointmentDiaryDto: MedivetSearchAppointmentDiaryDto
    ): Promise<MedivetAppointmentDiary[]> {
        const { offset, pageSize, include } = searchAppointmentDiaryDto;
        const diaries = await this.appointmentDiaryRepository.find({
            where: { appointment: { animal: { id: animalId } } },
            relations: include.split(","),
        });

        diaries.sort((a, b) => b.date.getTime() - a.date.getTime());

        return paginateData(diaries, {
            offset,
            pageSize
        });
    }

    private checkIfCanAddAppointmentDiaryToAppointment(appointment: MedivetAppointment): void {
        if (!appointment.finishedDate) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_ADD_DIARY_TO_NOT_FINISHED_APPOINTMENT,
                    property: "all"
                }
            ]);
        }

        const isMoreThan24Hours = moment(appointment.finishedDate).isAfter(moment().add(1, "days"));
        if (isMoreThan24Hours) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.IT_IS_TOO_LATE_TO_ADD_DIARY_TO_APPOINTMENT,
                    property: "all"
                }
            ]);
        }
    }

    private async checkIfAppointmentDiaryIsAlreadyCreatedForAppointment(appointmentId: number): Promise<void> {
        const diary = await this.appointmentDiaryRepository.findOne({
            where: { appointment: { id: appointmentId } },
            relations: [ "appointment" ]
        });

        if (diary) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.APPOINTMENT_ALREADY_HAS_DIARY,
                    property: "all"
                }
            ]);
        }
    }
}
