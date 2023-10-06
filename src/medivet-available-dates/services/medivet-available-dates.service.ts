import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Moment } from "moment/moment";
import { MoreThan, Repository } from "typeorm";

import { MedivetAppointment } from "@/medivet-appointments/entities/medivet-appointment.entity";
import { MedivetSearchAvailableDatesDto } from "@/medivet-available-dates/dto/medivet-search-available-dates.dto";
import { MedivetAvailableDate } from "@/medivet-available-dates/types/types";
import { MedivetDayWeek, MedivetVetAvailabilityDay } from "@/medivet-commons/enums/enums";
import { parseTimeStringToDate } from "@/medivet-commons/utils/date";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetProvidedMedicalServiceService } from "@/medivet-vet-provided-medical-services/services/medivet-vet-provided-medical-service.service";

@Injectable()
export class MedivetAvailableDatesService {
  private;

  // osobna funckja i endpoint do pobrania najbliższego wolnego terminu

  constructor(
    @InjectRepository(MedivetVetAvailability) private vetAvailabilityRepository: Repository<MedivetVetAvailability>,
    @InjectRepository(MedivetAppointment) private appointmentRepository: Repository<MedivetAppointment>,
    private providedMedicalServicesService: MedivetVetProvidedMedicalServiceService
  ) {
  }

  async getAvailableDatesForMedicalService(
      vetId: number,
      medicalServiceId: number,
      searchAvailableDatesDto?: MedivetSearchAvailableDatesDto
  ): Promise<MedivetAvailableDate[]> {
      const medicalService = await this.providedMedicalServicesService.findVetProvidedMedicalServiceById(medicalServiceId, [ "medicalService", "medicalService.specialization" ]);
      const vetAvailabilities = await this.vetAvailabilityRepository.find({
          where: {
              user: { id: vetId },
              specialization: { id: medicalService.medicalService.specialization.id }
          },
          relations: [ "receptionHours" ]
      });

      const medicalServiceDuration = medicalService.duration;
      const availableDates: MedivetAvailableDate[] = [];
      const maxAvailableDate = this.getMaxAvailableDate();
      const nearestMonth = searchAvailableDatesDto?.month || maxAvailableDate.getMonth();
      const now = moment();
      const remainingDaysOfMonth = this.getDaysForMonth(nearestMonth);

      const appointments = await this.appointmentRepository.find({
          where: {
              medicalService: { id: medicalServiceId },
              date: MoreThan(now.toDate())
          },
          relations: [ "medicalService" ]
      });

      remainingDaysOfMonth.forEach((remainingDay) => {
          const thisDay = moment().set({
              date: remainingDay,
              hours: 0,
              minutes: 0,
              seconds: 0,
              milliseconds: 0
          });
          const dayOfWeek = thisDay.day();

          const appointmentsForDay = appointments.filter(appointment => {
              const appointmentDate = moment(appointment.date).set({
                  hours: 0,
                  minutes: 0,
                  seconds: 0,
                  milliseconds: 0
              }).toDate();

              if (appointmentDate === thisDay.toDate()) return appointment;
          });
          const parsedAppointments = this.getCalculatedTimeForAppointments(appointmentsForDay);

          vetAvailabilities.forEach(vetAvailability => {
              const receptionHours = vetAvailability.receptionHours.filter(receptionHour => MedivetDayWeek[receptionHour.day] === dayOfWeek);
              const groupedReceptionHoursByDay: { id: number; day: MedivetDayWeek; hours: { hourFrom: string; hourTo: string }[] }[] = receptionHours.reduce((acc, cur) => {
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

              if (groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]] && Object.keys(groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]]).length !== 0) {
                  const receptionHourDay = groupedReceptionHoursByDay[MedivetDayWeek[dayOfWeek]];
                  let totalPossibleReceptionHourDates = [];
                  receptionHourDay.hours.sort((a, b) => Number(parseTimeStringToDate(a.hourFrom)) - Number(parseTimeStringToDate(b.hourFrom)));
                  receptionHourDay.hours.forEach(receptionHour => {
                      const { hourFrom, hourTo } = receptionHour;
                      const startDayDate = moment().set({
                          date: remainingDay,
                          hours: +hourFrom.split(":")[0],
                          minutes: +hourFrom.split(":")[1],
                          seconds: 0,
                          milliseconds: 0
                      });
                      const endDayDate = moment().set({
                          date: remainingDay,
                          hours: +hourTo.split(":")[0],
                          minutes: +hourTo.split(":")[1],
                          seconds: 0,
                          milliseconds: 0
                      });

                      const receptionHourTotalDuration = endDayDate.diff(startDayDate, "minutes");
                      const amountOfPossibleReceptionHours = Math.floor(receptionHourTotalDuration / +medicalServiceDuration);
                      const possibleReceptionHourDates: Moment[] = this.getAllPossibleReceptionHourDates(amountOfPossibleReceptionHours, medicalServiceDuration, startDayDate);
                      totalPossibleReceptionHourDates = [ ...totalPossibleReceptionHourDates, ...possibleReceptionHourDates ];
                  });
                  this.getAllAvailableReceptionHourDates(totalPossibleReceptionHourDates, parsedAppointments, availableDates, receptionHourDay.day);
              }
          });
          // bierze również dziejszy dzien ale trzeba wziac pod uwage godziny późniejsze niż 10 min od teraz
          // wyświetlić takie dostępności, które nie zaczynają się wtedy kiedy wizyta i uwzględnić ich czas trwania, aby

      });

      return availableDates;
  }

  private getDaysForMonth(month: number): number[] {
      const today = moment();
      const day = today.date();

      const daysInMonth = today.add(month, "month").daysInMonth();
      const days: number[] = [];
      for (let i = day; i <= daysInMonth; i++) {
          days.push(i);
      }
      return days;
  }

  private getMaxAvailableDate(): Date {
      const
          MAX_AVAILABLE_NEXT_MONTH = 1;
      const
          now = moment().set({
              hour: 0,
              minute: 0,
              second: 0
          });
      const maxAvailableDate = now.add(MAX_AVAILABLE_NEXT_MONTH, "month");
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

  private getAllPossibleReceptionHourDates(
      amountOfPossibleReceptionHours: number,
      medicalServiceDuration: number, startDayDate: Moment
  ): Moment[] {
      const allPossibleReceptionHourDates: Moment[] = [];
      let hour;
      while (amountOfPossibleReceptionHours !== -1) {
          const prevHour = allPossibleReceptionHourDates[allPossibleReceptionHourDates.length - 1] ?? startDayDate;
          hour = prevHour.clone().add(medicalServiceDuration, "minutes");
          allPossibleReceptionHourDates.push(hour);
          amountOfPossibleReceptionHours--;
      }
      return allPossibleReceptionHourDates;
  }

  private getAllAvailableReceptionHourDates(
      allPossibleReceptionHourDates: Moment[],
      parsedAppointments: { startDate: Moment; endDate: Moment }[],
      availableDates: MedivetAvailableDate[],
      day: MedivetVetAvailabilityDay
  ): void {
      const availableReceptionHours = [];
      allPossibleReceptionHourDates.forEach(possibleReceptionHourDate => {
          const collideWithAppointment = parsedAppointments.some(appointment => possibleReceptionHourDate.isBetween(appointment.startDate, appointment.endDate));
          if (!collideWithAppointment) availableReceptionHours.push(possibleReceptionHourDate.toDate());
      });
      availableDates.push({
          dates: [ ...availableReceptionHours ],
          day
      });
  }
}
