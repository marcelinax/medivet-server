import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { MedivetSearchClinicDto } from '@/medivet-clinics/dto/medivet-search-clinic.dto';
import { MedivetClinic } from '@/medivet-clinics/entities/medivet-clinic.entity';
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/medivet-sorting-mode.enum";
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class MedivetClinicsService {
    constructor(
        @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>,
        private usersService: MedivetUsersService,
    ) { }

    async createClinic(createClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        if (await this.checkIfClinicAlreadyExists(createClinicDto))
            throw new BadRequestException([ErrorMessagesConstants.CLINIC_ALREADY_EXISTS]);

        const newClinic = this.clinicsRepository.create({
            name: createClinicDto.name,
            address: createClinicDto.address,
            phoneNumber: createClinicDto.phoneNumber
        });
        await this.clinicsRepository.save(newClinic);
        return newClinic;

    }

    async findClinicById(id: number, include?: string[]): Promise<MedivetClinic> {
        const clinic = await this.clinicsRepository.findOne({
            where: { id },
            relations: include ?? []
        });

        if (!clinic) throw new NotFoundException([ErrorMessagesConstants.CLINIC_WITH_THIS_ID_DOES_NOT_EXIST]);
        return clinic;
    }

    async findClinicsAssignedToVet(vetId: number, searchClinicDto: MedivetSearchClinicDto, include?: string[]): Promise<MedivetClinic[]> {
        const clinics = await this.clinicsRepository.find({
            where: {
                vets: { id: vetId }
            },
            relations: include ?? []
        });

        const pageSize = searchClinicDto.pageSize || 10;
        const offset = searchClinicDto.offset || 0;
        return this.paginateClinics(clinics, offset, pageSize);
    }

    private async checkIfClinicAlreadyExists(createClinicDto: MedivetCreateClinicDto): Promise<boolean> {
        const { name, address } = createClinicDto;
        const existingClinic = await this.clinicsRepository.findOne({
            where: {
                name
            }
        });

        if (!existingClinic) return false;
        if (address.buildingNumber === existingClinic.address.buildingNumber &&
            address.city === existingClinic.address.city && address.street === existingClinic.address.street &&
            address.flatNumber === existingClinic.address.flatNumber) return true;
        return false;
    }

    async assignVetToClinic(
        vet: MedivetUser,
        clinicId: number,
    )
        : Promise<MedivetUser> {

        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            vet.clinics = [...vet.clinics, clinic];
            await this.usersService.saveUser(vet);
            return vet;
        }
    }

    async unassignVetFromClinic(vet: MedivetUser, clinicId: number): Promise<OkMessageDto> {
        // vet bedzie musiał wysłać zapytanie do admina o usunięcie, dopiero po zatwierdzeniu bedzie to mozliwe
        // await this.clinicToVetWithSpecializationsService.removeRelationshipBetweenClinicAndVetWithSpecializations(clinicId, vet);
        return { message: SuccessMessageConstants.VET_CLINIC_HAS_BEEN_UNASSIGNED_SUCCESSFULLY };
    }

    async findAllClinics(include?: string[]): Promise<MedivetClinic[]> {
        return this.clinicsRepository.find({
            relations: include ?? [],
        });
    }

    async searchClinics(searchClinicDto: MedivetSearchClinicDto): Promise<MedivetClinic[]> {
        let clinics = await this.findAllClinics(searchClinicDto?.include);

        if (searchClinicDto.name) {
            clinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(searchClinicDto.name.toLowerCase()));
        }

        if (searchClinicDto.city) {
            clinics = clinics.filter(clinic => clinic?.address?.city.toLowerCase() === searchClinicDto.city.toLowerCase());
        }

        if (searchClinicDto.street) {
            clinics = clinics.filter(clinic => clinic?.address?.street.toLowerCase() === searchClinicDto.street.toLowerCase());
        }

        if (searchClinicDto.zipCode) {
            clinics = clinics.filter(clinic => clinic?.address?.street.toLowerCase() === searchClinicDto.zipCode.toLowerCase());
        }

        if (searchClinicDto.buildingNumber) {
            clinics = clinics.filter(clinic => clinic?.address?.buildingNumber === searchClinicDto.buildingNumber);
        }

        if (searchClinicDto.flatNumber) {
            clinics = clinics.filter(clinic => clinic?.address?.flatNumber === searchClinicDto.flatNumber);
        }

        if (searchClinicDto.sortingMode) {
            clinics = clinics.sort((a, b) => {
                const aName: string = a.name.toLowerCase();
                const bName: string = b.name.toLowerCase();

                switch (searchClinicDto.sortingMode) {
                    case MedivetSortingModeEnum.ASC:
                        return aName.localeCompare(bName);
                    case MedivetSortingModeEnum.DESC:
                        return bName.localeCompare(aName);
                }
            });
        }

        const pageSize = searchClinicDto.pageSize || 10;
        const offset = searchClinicDto.offset || 0;

        return this.paginateClinics(clinics, offset, pageSize);
    }

    private paginateClinics(clinics: MedivetClinic[], offset: number, pageSize: number): MedivetClinic[] {
        return clinics.filter((_, index) => index >= offset && index < offset + pageSize);
    }

    async removeClinic(clinicId: number): Promise<void> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            const isClinicInUse = this.checkIfClinicIsInUse(clinic);
            if (isClinicInUse)
                throw new BadRequestException([ErrorMessagesConstants.CANNOT_REMOVE_VET_CLINIC_WHICH_IS_IN_USE]);

            await this.clinicsRepository.remove(clinic);
        }
    }


    private checkIfClinicIsInUse(clinic: MedivetClinic): boolean {
        return !!clinic.vets.find(vet => vet.id);
    }

    async updateClinic(clinicId: number, updateClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        const clinic = await this.findClinicById(clinicId);
        const { address, name, phoneNumber } = updateClinicDto;

        if (clinic) {

            clinic.address = { ...address };
            clinic.name = name;
            clinic.phoneNumber = phoneNumber;

            await this.clinicsRepository.save(clinic);
            return clinic;
        }
    }

}