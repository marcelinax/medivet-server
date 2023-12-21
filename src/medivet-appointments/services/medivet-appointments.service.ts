import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetAnimalsService } from "@/medivet-animals/services/medivet-animals.service";
import { MedivetCreateAppointmentDto } from "@/medivet-appointments/dto/medivet-create-appointment.dto";
import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
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
        console.log(isDateAvailable);
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
            date
        });
        await this.appointmentRepository.save(newAppointment);
        return newAppointment;
    };

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
