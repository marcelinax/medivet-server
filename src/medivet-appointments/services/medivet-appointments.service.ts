import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { MoreThan, Repository } from "typeorm";

import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { MedivetCreateAppointmentDto } from "@/medivet-appointments/dto/medivet-create-appointment.dto";
import { MedivetSearchAppointmentDto } from "@/medivet-appointments/dto/medivet-search-appointment.dto";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { MedivetAppointmentStatus, MedivetVacationStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetVacation } from "@/medivet-vacations/entities/medivet-vacation.entity";
import { MedivetVacationService } from "@/medivet-vacations/services/medivet-vacation.service";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@Injectable()
export class MedivetAppointmentsService {
    constructor(
    @InjectRepository(MedivetAppointment) private appointmentRepository: Repository<MedivetAppointment>,
    private medicalProvidedServicesService: MedivetVetProvidedMedicalServiceService,
    @Inject(forwardRef(() => MedivetAnimalsService))
    private animalsService: MedivetAnimalsService,
    private vacationService: MedivetVacationService,
    ) {
    }

    async createAppointment(createAppointmentDto: MedivetCreateAppointmentDto): Promise<MedivetAppointment> {
        const { medicalServiceId, animalId, date } = createAppointmentDto;
        const medicalService = await this.medicalProvidedServicesService.findVetProvidedMedicalServiceById(
            medicalServiceId,
            "user"
        );
        const isDateAvailable = await this.checkIfAppointmentDateIsAvailable(createAppointmentDto);

        if (!isDateAvailable) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CREATE_APPOINTMENT_BECAUSE_OF_NOT_AVAILABLE_DATE,
                    property: "all"
                }
            ]);
        }

        await this.checkIfAppointmentDateIsDuringVetVacation(medicalService.user, date);

        const animal = await this.animalsService.findOneAnimalById(animalId);

        const newAppointment = this.appointmentRepository.create({
            medicalService,
            animal,
            date,
            status: MedivetAppointmentStatus.IN_PROGRESS
        });
        await this.appointmentRepository.save(newAppointment);
        return newAppointment;
    };

    async getAppointments(user: MedivetUser, searchAppointmentDto: MedivetSearchAppointmentDto): Promise<MedivetAppointment[]> {
        const { status, offset, pageSize, include } = searchAppointmentDto;
        const allAppointments = await this.appointmentRepository.find({ relations: include.split(",") ?? [], });
        const userAppointments = this.getAppointmentsDependingOnUserRole(user, allAppointments);
        const appointmentsFilteredByStatus = !status ? [ ...userAppointments ] :
            userAppointments.filter(appointment => appointment.status === status);

        appointmentsFilteredByStatus.sort((a, b) => b.date.getTime() - a.date.getTime());

        return paginateData(appointmentsFilteredByStatus, {
            offset,
            pageSize
        });
    }

    async getNearestAppointment(user: MedivetUser, include: string): Promise<MedivetAppointment | undefined> {
        const allAppointments = await this.appointmentRepository.find({
            relations: include.split(",") ?? [],
            where: { status: MedivetAppointmentStatus.IN_PROGRESS }
        });
        const userAppointments = this.getAppointmentsDependingOnUserRole(user, allAppointments);
        userAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
        return userAppointments.find(appointment => moment(appointment.date).isAfter(moment()));
    }

    async findAppointmentById(id: number, include?: string): Promise<MedivetAppointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: include?.split(",") ?? [],
        });

        if (!appointment) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.APPOINTMENT_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }
        return appointment;
    }

    async finishAppointment(appointmentId: number, include?: string): Promise<MedivetAppointment> {
        const appointment = await this.findAppointmentById(appointmentId, include);

        if (appointment.status === "IN_PROGRESS") {
            appointment.status = MedivetAppointmentStatus.FINISHED;
            appointment.finishedDate = moment().toDate();
            await this.appointmentRepository.save(appointment);

            return appointment;
        } else {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.CANNOT_FINISH_APPOINTMENT_IN_DIFFERENT_STATUS_THAN_IN_PROGRESS,
                    property: "all"
                }
            ]);
        }
    }

    async cancelAppointment(appointmentId: number, include?: string): Promise<MedivetAppointment> {
        const appointment = await this.findAppointmentById(appointmentId, include);

        if (appointment.status === "IN_PROGRESS") {
            appointment.status = MedivetAppointmentStatus.CANCELLED;
            await this.appointmentRepository.save(appointment);

            return appointment;
        } else {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.CANNOT_CANCEL_APPOINTMENT_IN_DIFFERENT_STATUS_THAN_IN_PROGRESS,
                    property: "all"
                }
            ]);
        }
    }

    async checkIfAppointmentDateIsDuringVetVacation(user: MedivetUser, appointmentDate: Date): Promise<void> {
        const vacations = await this.vacationService.findAllVacationsForUser(user.id);

        const isVetOnVacation = vacations.find(vacation => {
            if (this.isVetOnVacation(vacation, appointmentDate)
        && vacation.status === MedivetVacationStatus.ACTIVE) {
                return vacation;
            }
        });

        if (isVetOnVacation) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.VET_IS_ON_VACATION,
                    property: "all"
                }
            ]);
        }

    }

    async getVetIncompleteAppointmentDiaries(
        vet: MedivetUser,
        paginationDto: OffsetPaginationDto,
        include?: string
    ): Promise<MedivetAppointment[]> {
        const relations = [ "medicalService", "medicalService.user", ...(include?.split(",") ?? []) ];
        const incompleteAppointmentDiaries = await this.appointmentRepository.find({
            where: {
                medicalService: { user: { id: vet.id } },
                diary: null,
                status: MedivetAppointmentStatus.FINISHED,
                finishedDate: MoreThan(moment().subtract(24, "h").toDate())
            },
            relations
        });

        return paginateData(incompleteAppointmentDiaries, paginationDto);
    }

    async cancelAllAnimalAppointments(animalId: number): Promise<void> {
        const appointments = await this.appointmentRepository.find({
            where: { animal: { id: animalId } },
            relations: [ "animal" ]
        });

        for (const appointment of appointments) {
            if (appointment.status === MedivetAppointmentStatus.IN_PROGRESS) {
                appointment.status = MedivetAppointmentStatus.CANCELLED;
                await this.appointmentRepository.save(appointment);
            }
        }

    }

    private getAppointmentsDependingOnUserRole(user: MedivetUser, appointments: MedivetAppointment[]): MedivetAppointment[] {
        switch (user.role) {
            case MedivetUserRole.ADMIN: {
                return appointments;
            }
            case MedivetUserRole.VET: {
                return appointments.filter(appointment => appointment.medicalService?.user?.id === user.id);
            }
            case MedivetUserRole.PATIENT: {
                return appointments.filter(appointment => appointment.animal?.owner?.id === user.id);
            }
            case MedivetUserRole.REMOVED:
            default:
                return [];
        }
    }

    private async checkIfAppointmentDateIsAvailable(createAppointmentDto: MedivetCreateAppointmentDto): Promise<boolean> {
        const { medicalServiceId, date } = createAppointmentDto;
        const appointment = await this.appointmentRepository.findOne({
            where: {
                medicalService: { id: medicalServiceId },
                date
            },
            relations: [ "medicalService" ]
        });
        return !appointment;
    }

    private isVetOnVacation(vacation: MedivetVacation, appointmentDate: Date): boolean {
        return !moment(appointmentDate).isBetween(moment(vacation.from), moment(vacation.to));
    }
}
