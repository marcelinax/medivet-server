import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { MedivetCreateAppointmentDto } from "@/medivet-appointments/dto/medivet-create-appointment.dto";
import { MedivetSearchAppointmentDto } from "@/medivet-appointments/dto/medivet-search-appointment.dto";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetAppointmentStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@Injectable()
export class MedivetAppointmentsService {
    constructor(
    @InjectRepository(MedivetAppointment) private appointmentRepository: Repository<MedivetAppointment>,
    private medicalProvidedServicesService: MedivetVetProvidedMedicalServiceService,
    private animalsService: MedivetAnimalsService,
    ) {
    }

    async createAppointment(createAppointmentDto: MedivetCreateAppointmentDto): Promise<MedivetAppointment> {
        const { medicalServiceId, animalId, date } = createAppointmentDto;

        const isDateAvailable = await this.checkIfAppointmentDateIsAvailable(createAppointmentDto);
        if (!isDateAvailable) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CREATE_APPOINTMENT_BECAUSE_OF_NOT_AVAILABLE_DATE,
                    property: "all"
                }
            ]);
        }

        const medicalService = await this.medicalProvidedServicesService.findVetProvidedMedicalServiceById(medicalServiceId);
        const animal = await this.animalsService.findOneAnimalById(animalId);

        const newAppointment = await this.appointmentRepository.create({
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
        const allAppointments = await this.appointmentRepository.find({ relations: include ?? [], });
        const userAppointments = this.getAppointmentsDependingOnUserRole(user, allAppointments);
        const appointmentsFilteredByStatus = !status ? [ ...userAppointments ] :
            userAppointments.filter(appointment => appointment.status === status);

        appointmentsFilteredByStatus.sort((a, b) => b.date.getTime() - a.date.getTime());

        return paginateData(appointmentsFilteredByStatus, {
            offset,
            pageSize
        });
    }

    async findAppointmentById(id: number, include?: string[]): Promise<MedivetAppointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: include ?? [],
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
}
