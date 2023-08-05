import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Not, Repository } from "typeorm";

import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { parseTimeStringToDate } from "@/medivet-commons/utils/date";
import { MedivetVetSpecializationService } from "@/medivet-specializations/services/medivet-vet-specialization.service";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";
import { MedivetCreateVetAvailabilityDto } from "@/medivet-vet-availabilities/dto/medivet-create-vet-availability.dto";
import { MedivetVetAvailability } from "@/medivet-vet-availabilities/entities/medivet-vet-availability.entity";
import { MedivetVetAvailabilityReceptionHour } from "@/medivet-vet-availabilities/entities/medivet-vet-availability-reception-hour.entity";

import { MedivetCreateVetAvailabilityReceptionHourDto } from "../dto/medivet-create-vet-availability-reception-hour.dto";

@Injectable()
export class MedivetVetAvailabilitiesService {
    constructor(
    @InjectRepository(MedivetVetAvailability) private vetAvailabilitiesRepository: Repository<MedivetVetAvailability>,
    @InjectRepository(MedivetVetAvailabilityReceptionHour) private vetReceptionHourRepository: Repository<MedivetVetAvailabilityReceptionHour>,
    private usersService: MedivetUsersService,
    private clinicsService: MedivetClinicsService,
    private specializationsService: MedivetVetSpecializationService
    ) {
    }

    async createVetAvailability(
        createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
        user: MedivetUser
    ): Promise<MedivetVetAvailability> {
        const { clinicId, userId, specializationId, receptionHours } = createVetAvailabilityDto;
        const clinic = await this.clinicsService.findClinicById(clinicId);
        const vet = await this.usersService.findVetById(userId);
        const specialization = await this.specializationsService.findOneVetSpecializationById(specializationId);

        const existingVetAvailability = await this.checkIfVetAvailabilityForClinicAndSpecializationExists(createVetAvailabilityDto);
        if (existingVetAvailability) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.VET_AVAILABILITY_FOR_CLINIC_AND_SPECIALIZATION_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        for (let i = 0; i < receptionHours.length; i++) {
            const receptionHour = receptionHours[i];
            this.validateReceptionHourTime(receptionHour.hourFrom);
            this.validateReceptionHourTime(receptionHour.hourTo);
        }

        const vetAvailability = this.vetAvailabilitiesRepository.create({
            clinic,
            receptionHours: receptionHours.map(hour => this.vetReceptionHourRepository.create({ ...hour })),
            specialization,
            user: vet
        });

        this.validateVetAvailabilityReceptionHours(createVetAvailabilityDto);

        const collidedReceptionHour = this.validateVetAvailabilityNewReceptionHoursCollision(createVetAvailabilityDto);

        if (collidedReceptionHour) {
            const collidedReceptionHourIndex = receptionHours.indexOf(collidedReceptionHour);
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.RECEPTION_HOUR_COLLIDES_WITH_ANOTHER_ONE,
                    property: "receptionHour",
                    resource: { index: collidedReceptionHourIndex }
                }
            ]);
        }

        const collidedReceptionHourWithExistingOne = this.validateNewVetAvailabilityReceptionHoursCollisionWithExistingOne(createVetAvailabilityDto, user);

        if (collidedReceptionHourWithExistingOne) {
            const collidedReceptionHourIndex = receptionHours.indexOf(collidedReceptionHourWithExistingOne);
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.RECEPTION_HOUR_COLLIDES_WITH_EXISTING_ONE,
                    property: "receptionHour",
                    resource: { index: collidedReceptionHourIndex }
                }
            ]);
        }

        await this.vetAvailabilitiesRepository.save(vetAvailability);
        return vetAvailability;
    }

    async findVetAvailabilityById(id: number, include?: string[]): Promise<MedivetVetAvailability> {
        const vetAvailability = await this.vetAvailabilitiesRepository.findOne({
            where: { id },
            relations: include ?? []
        });

        if (!vetAvailability) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.VET_AVAILABILITY_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }
        return vetAvailability;
    }

    async findAllVetAvailabilities(
        vetId?: number,
        clinicId?: number,
        include?: string[]
    ): Promise<MedivetVetAvailability[]> {

        return this.vetAvailabilitiesRepository.find({
            where: {
                user: { id: vetId ?? Not(undefined) },
                clinic: { id: clinicId ?? Not(undefined) },
            },
            relations: include || []
        });
    }

    private validateReceptionHourTime(time: string): void {
        if (!time.includes(":")) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.INVALID_RECEPTION_HOUR_TIME_FORMAT,
                    property: "receptionHourTime"
                }
            ]);
        }
        const timeParts = time.split(":");
        const hour = Number(timeParts[0]);
        const minute = Number(timeParts[1]);
        const FIRST_HOUR = 0;
        const LAST_HOUR = 23;
        const FIRST_MINUTE = 0;
        const LAST_MINUTE = 59;
        const isHourValid = hour >= FIRST_HOUR && hour <= LAST_HOUR && Number.isInteger(hour) && timeParts[0].length === 2;
        if (!isHourValid) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.INVALID_HOUR_FORMAT,
                    property: "receptionHourTime"
                }
            ]);
        }
        const isMinuteValid = minute >= FIRST_MINUTE && minute <= LAST_MINUTE && Number.isInteger(minute) && timeParts[1].length === 2;
        if (!isMinuteValid) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.INVALID_MINUTE_FORMAT,
                    property: "receptionHourTime"
                }
            ]);
        }
    }

    private async checkIfVetAvailabilityForClinicAndSpecializationExists(createVetAvailabilityDto: MedivetCreateVetAvailabilityDto): Promise<boolean> {
        const { clinicId, specializationId, userId } = createVetAvailabilityDto;
        const existingVetAvailability = await this.vetAvailabilitiesRepository.findOne({
            where: {
                user: { id: userId },
                clinic: { id: clinicId },
                specialization: { id: specializationId }
            },
        });

        return !!existingVetAvailability;
    }

    private getCalculatedReceptionHoursPairDurationInSeconds({ hourFrom, hourTo }: Record<string, string>): number {
        const hourFromParts = hourFrom.split(":");
        const hourToParts = hourTo.split(":");

        const a = moment([ +hourFromParts[0], +hourFromParts[1], +hourFromParts[2] ], "HH:mm:ss");
        const b = moment([ +hourToParts[0], +hourToParts[1], +hourToParts[2] ], "HH:mm:ss");

        return b.diff(a, "seconds");
    }

    // validation only for new reception hours
    private validateVetAvailabilityNewReceptionHoursCollision(createVetAvailabilityDto: MedivetCreateVetAvailabilityDto): MedivetCreateVetAvailabilityReceptionHourDto | undefined {
        const { receptionHours } = createVetAvailabilityDto;

        const groupedReceptionHoursByDay: MedivetVetAvailabilityReceptionHour[][] = Object.values(
            receptionHours.reduce((acc, current) => {
                acc[current.day] = acc[current.day] ?? [];
                acc[current.day].push(current);
                return acc;
            }, {})
        );

        let collidedReceptionHour;
        const collide = groupedReceptionHoursByDay.some(groupedReceptionHour => {
            for (let i = 0; i < groupedReceptionHour.length; i++) {
                const currentReceptionHour = groupedReceptionHour[i];

                for (let j = 1; j < groupedReceptionHour.length; j++) {
                    const nextReceptionHour = groupedReceptionHour[j];
                    const notValid = this.checkIfVetAvailabilityReceptionHourCollidesWithAnother(nextReceptionHour, currentReceptionHour);

                    if (notValid) {
                        collidedReceptionHour = nextReceptionHour;
                        return nextReceptionHour;
                    } else return false;
                }
            }
        });

        if (collide) return collidedReceptionHour;
        return undefined;
    }

    // validation for new reception hours in comparison to existed reception hours
    private validateNewVetAvailabilityReceptionHoursCollisionWithExistingOne(
        createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
        user: MedivetUser,
    ): MedivetCreateVetAvailabilityReceptionHourDto | undefined {
        const vetAvailabilities = user.vetAvailabilities;
        const { receptionHours } = createVetAvailabilityDto;

        for (let i = 0; i < receptionHours.length; i++) {
            const receptionHour = receptionHours[i];
            const availabilitiesWithSameDay = vetAvailabilities.filter(availability => availability.receptionHours.find(availabilityReceptionHour => availabilityReceptionHour.day === receptionHour.day));

            if (availabilitiesWithSameDay.length === 0) return undefined;

            const allReceptionHours = availabilitiesWithSameDay.map(availability => availability.receptionHours).flat();
            const allReceptionHoursPairs = allReceptionHours.map(receptionHour => {
                const pair = {
                    hourFrom: receptionHour.hourFrom,
                    hourTo: receptionHour.hourTo
                };
                return {
                    ...pair,
                    duration: this.getCalculatedReceptionHoursPairDurationInSeconds(pair)
                };
            });

            const collide = allReceptionHoursPairs.some(receptionHourPair => {
                return this.checkIfVetAvailabilityReceptionHourCollidesWithAnother(receptionHourPair, receptionHour);
            });

            if (collide) return receptionHour;
        }

        return undefined;
    }

    private checkIfVetAvailabilityReceptionHourCollidesWithAnother(
        firstReceptionHour: MedivetVetAvailabilityReceptionHour | { hourFrom: string; hourTo: string; duration: number },
        secondReceptionHour: MedivetVetAvailabilityReceptionHour | MedivetCreateVetAvailabilityReceptionHourDto,
    ): boolean {
        const firstHourFromDate = parseTimeStringToDate(firstReceptionHour.hourFrom, true);
        const secondHourFromDate = parseTimeStringToDate(secondReceptionHour.hourFrom, true);
        const firstHourToDate = parseTimeStringToDate(firstReceptionHour.hourTo, true);
        const secondHourToDate = parseTimeStringToDate(secondReceptionHour.hourTo, true);

        return firstHourFromDate < secondHourToDate && secondHourFromDate < firstHourToDate;
    }

    private validateVetAvailabilityReceptionHours(
        createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
    ): void {
        const { receptionHours } = createVetAvailabilityDto;
        for (let i = 0; i < receptionHours.length; i++) {
            const receptionHour = receptionHours[i];

            if (receptionHour.hourFrom > receptionHour.hourTo) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.HOUR_TO_CANNOT_BE_EARLIER_THAN_HOUR_FROM,
                        property: "receptionHour",
                        resource: { index: i }
                    }
                ]);
            }
        }
    }

}
