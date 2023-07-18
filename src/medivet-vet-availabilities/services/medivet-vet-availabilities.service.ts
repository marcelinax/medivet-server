import { MedivetClinicsService } from '@/medivet-clinics/services/medivet-clinics.service';
import { ErrorMessagesConstants } from '@/medivet-commons/constants/error-messages.constants';
import { MedivetVetSpecializationService } from '@/medivet-specializations/services/medivet-vet-specialization.service';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { MedivetCreateVetAvailabilityDto } from '@/medivet-vet-availabilities/dto/medivet-create-vet-availability.dto';
import { MedivetVetAvailabilityReceptionHour } from '@/medivet-vet-availabilities/entities/medivet-vet-availability-reception-hour.entity';
import { MedivetVetAvailability } from '@/medivet-vet-availabilities/entities/medivet-vet-availability.entity';
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from 'moment';
import { Not, Repository } from "typeorm";
import { MedivetCreateVetAvailabilityReceptionHourDto } from '../dto/medivet-create-vet-availability-reception-hour.dto';

@Injectable()
export class MedivetVetAvailabilitiesService {
    constructor(
        @InjectRepository(MedivetVetAvailability) private vetAvailabilitiesRepository: Repository<MedivetVetAvailability>,
        @InjectRepository(MedivetVetAvailabilityReceptionHour) private vetReceptionHourRepository: Repository<MedivetVetAvailabilityReceptionHour>,
        private usersService: MedivetUsersService,
        private clinicsService: MedivetClinicsService,
        private specializationsService: MedivetVetSpecializationService
    ) { }

    async createVetAvailability(
        createVetAvailabilityDto: MedivetCreateVetAvailabilityDto,
        user: MedivetUser
    ): Promise<MedivetVetAvailability> {
        const { clinicId, userId, specializationId, receptionHours } = createVetAvailabilityDto;
        const clinic = await this.clinicsService.findClinicById(clinicId);
        const vet = await this.usersService.findVetById(userId);
        const specialization = await this.specializationsService.findOneVetSpecializationById(specializationId);

        const existingVetAvailability = await this.checkIfVetAvailabilityForClinicAndSpecializationExists(createVetAvailabilityDto);
        if(existingVetAvailability) {
          throw  new BadRequestException([ErrorMessagesConstants.VET_AVAILABILITY_FOR_CLINIC_AND_SPECIALIZATION_ALREADY_EXISTS])
        }

        const vetAvailability = this.vetAvailabilitiesRepository.create({
            clinic,
            receptionHours: receptionHours.map(hour => this.vetReceptionHourRepository.create({ ...hour })),
            specialization,
            user: vet
        });

        const collidatedReceptionHour = this.checkIfVetAvailabilityReceptionHourColidatesWithAnother(createVetAvailabilityDto, user);

        if (collidatedReceptionHour) {
            const collidatedReceptionHourIndex = receptionHours.indexOf(collidatedReceptionHour);
            throw new BadRequestException([`${ErrorMessagesConstants.RECEPTION_HOUR_COLIDATES_WITH_EXISTING_ONE} ${collidatedReceptionHourIndex}`]);
        }
        await this.vetAvailabilitiesRepository.save(vetAvailability);
        return vetAvailability;
    }

    private async checkIfVetAvailabilityForClinicAndSpecializationExists(createVetAvailabilityDto: MedivetCreateVetAvailabilityDto): Promise<boolean> {
      const {clinicId, specializationId, userId} = createVetAvailabilityDto;
      const existingVetAvailability = await this.vetAvailabilitiesRepository.findOne({
        where: {
          user: {id: userId},
          clinic: {id: clinicId},
          specialization: {id: specializationId}
        },
      })

      return !!existingVetAvailability;
    }

    private getCalculatedReceptionHoursPairDurationInSeconds({ hourFrom, hourTo }: Record<string, string>): number {
        const hourFromParts = hourFrom.split(':');
        const hourToParts = hourTo.split(':');

        const a = moment([+hourFromParts[0], +hourFromParts[1], +hourFromParts[2]], "HH:mm:ss");
        const b = moment([+hourToParts[0], +hourToParts[1], +hourToParts[2]], "HH:mm:ss");

        return b.diff(a, 'seconds');
    }

    private checkIfVetAvailabilityReceptionHourColidatesWithAnother(
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
                const pair = { hourFrom: receptionHour.hourFrom, hourTo: receptionHour.hourTo };
                return { ...pair, duration: this.getCalculatedReceptionHoursPairDurationInSeconds(pair) };
            });

            const receptionHourDurationInSeconds = this.getCalculatedReceptionHoursPairDurationInSeconds({ hourFrom: receptionHour.hourFrom, hourTo: receptionHour.hourTo });

            const collidate = allReceptionHoursPairs.some(receptionHourPair => {
                if ((receptionHourPair.hourFrom >= receptionHour.hourFrom && receptionHourPair.hourTo <= receptionHour.hourTo && receptionHourPair.duration < receptionHourDurationInSeconds)
                    || (receptionHourPair.hourFrom >= receptionHour.hourFrom && receptionHourPair.hourTo >= receptionHour.hourTo && receptionHourDurationInSeconds >= receptionHourPair.duration)
                    || (receptionHourPair.hourFrom <= receptionHour.hourFrom && receptionHourPair.hourTo <= receptionHour.hourTo)
                    || (receptionHourPair.hourFrom <= receptionHour.hourFrom && receptionHourPair.hourTo >= receptionHour.hourTo))
                    return true;
                return false;
            });

            if (collidate) return receptionHour;
        }

        return undefined;
    }

    async findVetAvailabilityById(id: number, include?: string[]): Promise<MedivetVetAvailability> {
        const vetAvailability = await this.vetAvailabilitiesRepository.findOne({
            where: { id },
            relations: include ?? []
        });

        if (!vetAvailability) {
            throw new NotFoundException([ErrorMessagesConstants.VET_AVAILABILITY_WITH_THIS_ID_DOES_NOT_EXIST]);
        }
        return vetAvailability;
    }

    async findAllVetAvailabilities(
        vetId?: number,
        clinicId?: number,
        include?: string[]): Promise<MedivetVetAvailability[]> {
        // let where = {};
        // if (vetId) {
        //     where = {
        //         ...where,
        //         user: { id: vetId }
        //     };
        // }

        return this.vetAvailabilitiesRepository.find({
            where: {
                user: { id: vetId ?? Not(undefined) },
                clinic: { id: clinicId ?? Not(undefined) },
            },
          relations: include || []
        });
    }
}
