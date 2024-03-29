import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Moment } from "moment/moment";
import { MoreThan, Repository } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetAvailableDate } from "@/medivet-available-dates/types/types";
import { MedivetAvailableDatesFilter, MedivetDayWeek, MedivetVetAvailabilityDay } from "@/medivet-commons/enums/enums";
import { parseTimeStringToDate } from "@/medivet-commons/utils/date";
import { MedivetVacation } from "@/medivet-vacations/entities/medivet-vacation.entity";
import { MedivetVacationService } from "@/medivet-vacations/services/medivet-vacation.service";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetAvailabilityReceptionHour } from "@/medivet-vet-availabilities/entities/medivet-vet-availability-reception-hour.entity";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@Injectable()
export class MedivetAvailableDatesService {

    constructor(
    @InjectRepository(MedivetVetAvailability) private vetAvailabilityRepository: Repository<MedivetVetAvailability>,
    @InjectRepository(MedivetAppointment) private appointmentRepository: Repository<MedivetAppointment>,
    @Inject(forwardRef(() => MedivetVetProvidedMedicalServiceService)) private providedMedicalServicesService: MedivetVetProvidedMedicalServiceService,
    private vacationService: MedivetVacationService
    ) {
    }

    async getAvailableDatesForMedicalService(
        vetId: number,
        medicalServiceId: number,
    ): Promise<MedivetAvailableDate[]> {
        const medicalService = await this.providedMedicalServicesService.findVetProvidedMedicalServiceById(medicalServiceId, "medicalService,medicalService.specialization");
        const vetAvailabilities = await this.vetAvailabilityRepository.find({
            where: {
                user: { id: vetId },
                specialization: { id: medicalService.medicalService.specialization.id }
            },
            relations: [ "receptionHours" ]
        });

        const medicalServiceDuration = medicalService.duration;
        const availableDates: MedivetAvailableDate[] = [];
        const now = moment();
        const remainingDays = this.getNext30DatesFromNow();
        const vetVacations = await this.vacationService.findAllVacationsForUser(vetId);

        const appointments = await this.appointmentRepository.find({
            where: {
                medicalService: { id: medicalServiceId },
                date: MoreThan(now.toDate())
            },
            relations: [ "medicalService" ]
        });

        remainingDays.forEach((remainingDay) => {
            let thisDay = remainingDay.clone().set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            });
            const isToday = now.clone().set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            }).isSame(thisDay.clone());

            if (isToday) {
                thisDay = now.clone().add(10, "minute");
            }

            const dayOfWeek = thisDay.day();

            const appointmentsForDay = appointments.filter(appointment => {
                const appointmentDate = moment(appointment.date).set({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0
                });

                if (appointmentDate.isSame(thisDay)) return appointment;
            });
            const parsedAppointments = this.getCalculatedTimeForAppointments(appointmentsForDay);

            vetAvailabilities.forEach(vetAvailability => {
                const receptionHours = vetAvailability.receptionHours.filter(receptionHour => MedivetDayWeek[receptionHour.day] === dayOfWeek);
                const groupedReceptionHoursByDay = this.getGroupedReceptionHoursByDayWeek(receptionHours);

                if (groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]] && Object.keys(groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]]).length !== 0) {
                    const receptionHourDay = groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]];
                    let totalPossibleReceptionHourDates = [];
                    receptionHourDay.hours.sort((a, b) => Number(parseTimeStringToDate(a.hourFrom)) - Number(parseTimeStringToDate(b.hourFrom)));
                    receptionHourDay.hours.forEach(receptionHour => {
                        const { hourFrom, hourTo } = receptionHour;
                        const startDayDate = thisDay.clone().set({
                            hours: +hourFrom.split(":")[0],
                            minutes: +hourFrom.split(":")[1],
                        });
                        const endDayDate = thisDay.clone().set({
                            hours: +hourTo.split(":")[0],
                            minutes: +hourTo.split(":")[1],
                        });

                        const receptionHourTotalDuration = endDayDate.diff(startDayDate, "minutes");
                        const amountOfPossibleReceptionHours = Math.floor(receptionHourTotalDuration / +medicalServiceDuration);
                        const possibleReceptionHourDates: Moment[] = this.getAllPossibleReceptionHourDates(amountOfPossibleReceptionHours, medicalServiceDuration, startDayDate, vetVacations);
                        totalPossibleReceptionHourDates = [ ...totalPossibleReceptionHourDates, ...possibleReceptionHourDates ];
                    });
                    this.getAllAvailableReceptionHourDates(totalPossibleReceptionHourDates, parsedAppointments, availableDates, receptionHourDay.day, remainingDay.set({
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        milliseconds: 0
                    }));
                }
            });
        });
        return availableDates;
    }

    async getFirstAvailableDateForMedicalService(
        vetId: number,
        medicalServiceId: number,
    ): Promise<MedivetAvailableDate | undefined> {
        const medicalService = await this.providedMedicalServicesService.findVetProvidedMedicalServiceById(medicalServiceId, "medicalService,medicalService.specialization");
        const vetAvailabilities = await this.vetAvailabilityRepository.find({
            where: {
                user: { id: vetId },
                specialization: { id: medicalService.medicalService.specialization.id }
            },
            relations: [ "receptionHours" ]
        });

        const medicalServiceDuration = medicalService.duration;
        const now = moment();
        const remainingDays = this.getNext30DatesFromNow();
        const vetVacations = await this.vacationService.findAllVacationsForUser(vetId);

        const appointments = await this.appointmentRepository.find({
            where: {
                medicalService: { id: medicalServiceId },
                date: MoreThan(now.toDate())
            },
            relations: [ "medicalService" ]
        });
        let result = undefined;

        for (let i = 0; i < remainingDays.length; i++) {
            let thisDay = remainingDays[i].set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            });

            const isToday = now.clone().set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            }).isSame(thisDay.clone());

            if (isToday) {
                thisDay = now.clone().add(10, "minute");
            }

            const dayOfWeek = thisDay.day();
            const appointmentsForDay = appointments.filter(appointment => {
                const appointmentDate = moment(appointment.date).set({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0
                });

                if (appointmentDate.isSame(thisDay)) return appointment;
            });
            const parsedAppointments = this.getCalculatedTimeForAppointments(appointmentsForDay);

            vetAvailabilities.forEach(vetAvailability => {
                const receptionHours = vetAvailability.receptionHours.filter(receptionHour => MedivetDayWeek[receptionHour.day] === dayOfWeek);
                const groupedReceptionHoursByDay = this.getGroupedReceptionHoursByDayWeek(receptionHours);

                if (groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]] && Object.keys(groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]]).length !== 0) {
                    const receptionHourDay = groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]];
                    receptionHourDay.hours.sort((a, b) => Number(parseTimeStringToDate(a.hourFrom)) - Number(parseTimeStringToDate(b.hourFrom)));
                    for (let j = 0; j < receptionHourDay.hours.length; j++) {
                        if (result) break;
                        const receptionHour = receptionHourDay.hours[j];
                        const { hourFrom, hourTo } = receptionHour;
                        const startDayDate = thisDay.clone().set({
                            hours: +hourFrom.split(":")[0],
                            minutes: +hourFrom.split(":")[1],
                        });
                        const endDayDate = thisDay.clone().set({
                            hours: +hourTo.split(":")[0],
                            minutes: +hourTo.split(":")[1],
                        });
                        const receptionHourTotalDuration = endDayDate.diff(startDayDate, "minutes");
                        const amountOfPossibleReceptionHours = Math.floor(receptionHourTotalDuration / +medicalServiceDuration);
                        const possibleReceptionHourDates: Moment[] = this.getAllPossibleReceptionHourDates(amountOfPossibleReceptionHours, medicalServiceDuration, startDayDate, vetVacations);

                        const availableReceptionHours = [];
                        possibleReceptionHourDates.forEach(possibleReceptionHourDate => {
                            const collideWithAppointment = parsedAppointments.some(appointment => possibleReceptionHourDate.isBetween(appointment.startDate, appointment.endDate));
                            if (!collideWithAppointment) availableReceptionHours.push(possibleReceptionHourDate.toDate());
                        });
                        if (availableReceptionHours.length > 0) {
                            result = {
                                day: receptionHourDay.day,
                                dates: [ ...availableReceptionHours ]
                            };
                            break;
                        }
                    }
                }
            });
        }
        return result;
    }

    async checkIfAvailableDateForMedicalServiceExists(
        vetId: number,
        medicalServiceId: number,
        availableDatesFilter: MedivetAvailableDatesFilter
    ): Promise<boolean> {
        const medicalService = await this.providedMedicalServicesService.findVetProvidedMedicalServiceById(medicalServiceId, "medicalService,medicalService.specialization");
        const vetAvailabilities = await this.vetAvailabilityRepository.find({
            where: {
                user: { id: vetId },
                specialization: { id: medicalService.medicalService.specialization.id }
            },
            relations: [ "receptionHours" ]
        });
        const vetVacations = await this.vacationService.findAllVacationsForUser(vetId);

        const medicalServiceDuration = medicalService.duration;
        let remainingDays: moment.Moment[] = [];
        const now = moment();
        let maxAvailableDate;

        switch (availableDatesFilter) {
            case MedivetAvailableDatesFilter.TODAY: {
                maxAvailableDate = now.clone().startOf("day");
                remainingDays.push(maxAvailableDate);
                break;
            }
            case MedivetAvailableDatesFilter.WITHIN_3_DAYS: {
                const startDate = now.clone().add(1, "day");
                for (let i = 0; i < 3; i++) {
                    remainingDays.push(startDate.clone());
                    startDate.add(1, "days");
                }
                maxAvailableDate = remainingDays[remainingDays.length - 1];
                break;
            }
            case MedivetAvailableDatesFilter.WHENEVER: {
                maxAvailableDate = this.getMaxAvailableDate();
                remainingDays = this.getNext30DatesFromNow();
            }
        }

        const appointments = await this.appointmentRepository.find({
            where: {
                medicalService: { id: medicalServiceId },
                date: MoreThan(now.toDate())
            },
            relations: [ "medicalService" ]
        });
        let result = false;

        for (let i = 0; i < remainingDays.length; i++) {
            if (result) break;
            let thisDay = remainingDays[i].set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            });

            const isToday = now.clone().set({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            }).isSame(thisDay.clone());

            if (isToday) {
                thisDay = now.clone().add(10, "minute");
            }

            const dayOfWeek = thisDay.day();
            const appointmentsForDay = appointments.filter(appointment => {
                const appointmentDate = moment(appointment.date).set({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0
                });

                if (appointmentDate.isSame(thisDay)) return appointment;
            });
            const parsedAppointments = this.getCalculatedTimeForAppointments(appointmentsForDay);

            result = vetAvailabilities.some(vetAvailability => {
                const receptionHours = vetAvailability.receptionHours.filter(receptionHour => MedivetDayWeek[receptionHour.day] === dayOfWeek);
                const groupedReceptionHoursByDay = this.getGroupedReceptionHoursByDayWeek(receptionHours);

                if (groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]] && Object.keys(groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]]).length !== 0) {
                    const receptionHourDay = groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]];
                    receptionHourDay.hours.sort((a, b) => Number(parseTimeStringToDate(a.hourFrom)) - Number(parseTimeStringToDate(b.hourFrom)));

                    return receptionHourDay.hours.some(receptionHour => {
                        const { hourFrom, hourTo } = receptionHour;
                        const startDayDate = thisDay.clone().set({
                            hours: +hourFrom.split(":")[0],
                            minutes: +hourFrom.split(":")[1],
                        });
                        const endDayDate = thisDay.clone().set({
                            hours: +hourTo.split(":")[0],
                            minutes: +hourTo.split(":")[1],
                        });
                        const receptionHourTotalDuration = endDayDate.diff(startDayDate, "minutes");
                        const amountOfPossibleReceptionHours = Math.floor(receptionHourTotalDuration / +medicalServiceDuration);
                        const possibleReceptionHourDates: Moment[] = this.getAllPossibleReceptionHourDates(amountOfPossibleReceptionHours, medicalServiceDuration, startDayDate, vetVacations);

                        const availableReceptionHours = [];
                        possibleReceptionHourDates.forEach(possibleReceptionHourDate => {
                            const collideWithAppointment = parsedAppointments.some(appointment => possibleReceptionHourDate.isBetween(appointment.startDate, appointment.endDate));
                            if (!collideWithAppointment) availableReceptionHours.push(possibleReceptionHourDate.toDate());
                        });
                        if (availableReceptionHours.length > 0) {
                            return true;
                        }
                    });
                }
            });
        }

        return result;
    }

    private getGroupedReceptionHoursByDayWeek(receptionHours: MedivetVetAvailabilityReceptionHour[]): {
    id: number;
    day: MedivetDayWeek;
    hours: { hourFrom: string; hourTo: string }[];
  }[] {
        return receptionHours.reduce((acc, cur) => {
            const hours = [ ...(acc[cur.day]?.hours || []) ];
            acc[cur.day] = {
                id: cur.id,
                day: cur.day,
                hours: [
                    ...hours,
                    {
                        hourFrom: cur.hourFrom,
                        hourTo: cur.hourTo
                    }
                ]
            };
            if (acc) return acc;
        }, []);
    }

    private getNext30DatesFromNow(): moment.Moment[] {
        const dates: moment.Moment[] = [];
        const now = moment();
        for (let i = 0; i < 30; i++) {
            dates.push(now.clone());
            now.add(1, "day");
        }
        return dates;
    }

    private getMaxAvailableDate(): Date {
        const
            MAX_AVAILABLE_DAYS = 30;
        const
            now = moment().set({
                hour: 0,
                minute: 0,
                second: 0
            });
        const maxAvailableDate = now.add(MAX_AVAILABLE_DAYS, "days");
        return maxAvailableDate.toDate();
    }

    private getCalculatedTimeForAppointments(
        appointments: MedivetAppointment[]
    ): { startDate: Moment; endDate: Moment }[] {
        return appointments.map(appointment => {
            const duration = appointment.medicalService.duration * 60;
            const startDate = moment(appointment.date);
            const endDate = moment(appointment.date).add(duration, "seconds");

            return {
                startDate,
                endDate,
            };
        });
    }

    private isDateAvailableBecauseOfVetVacation(vacations: MedivetVacation[], date: Moment): boolean {
        const anyVacationAtAvailableDate = vacations.find(vacation => {
            if (date.isBetween(moment(vacation.from), moment(vacation.to)) &&
        vacation.status === "ACTIVE"
            ) {
                return vacation;
            }
        });

        return !anyVacationAtAvailableDate;
    }

    private getAllPossibleReceptionHourDates(
        amountOfPossibleReceptionHours: number,
        medicalServiceDuration: number,
        startDayDate: Moment,
        vacations: MedivetVacation[]
    ): Moment[] {
        const allPossibleReceptionHourDates: Moment[] = [];
        const now = moment();
        if (
            startDayDate.clone().isAfter(now) && this.isDateAvailableBecauseOfVetVacation(vacations, (startDayDate.clone()))) {
            allPossibleReceptionHourDates.push(startDayDate.clone());
        }
        let hour;

        while (amountOfPossibleReceptionHours !== 0) {
            const prevHour = hour?.clone() ?? startDayDate.clone();
            hour = prevHour.clone().add(medicalServiceDuration, "minutes");
            if (prevHour.isSameOrAfter(now) && this.isDateAvailableBecauseOfVetVacation(vacations, prevHour)) {
                allPossibleReceptionHourDates.push(hour);
            }
            amountOfPossibleReceptionHours--;
        }
        return allPossibleReceptionHourDates;
    }

    private getAllAvailableReceptionHourDates(
        allPossibleReceptionHourDates: Moment[],
        parsedAppointments: { startDate: Moment; endDate: Moment }[],
        availableDates: MedivetAvailableDate[],
        day: MedivetVetAvailabilityDay,
        date: Moment
    ): void {
        const availableReceptionHours = [];
        allPossibleReceptionHourDates.forEach(possibleReceptionHourDate => {
            const collideWithAppointment = parsedAppointments.some(appointment => possibleReceptionHourDate.isBetween(appointment.startDate, appointment.endDate));
            if (!collideWithAppointment) availableReceptionHours.push(possibleReceptionHourDate.toDate());
        });
        availableDates.push({
            dates: [ ...availableReceptionHours ],
            day,
            date: date.toDate()
        });
    }
}
