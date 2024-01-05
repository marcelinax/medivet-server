import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Repository } from "typeorm";

import { MedivetCreateClinicDto } from "@/medivet-clinics/dto/medivet-create-clinic.dto";
import { MedivetSearchAdminClinicDto } from "@/medivet-clinics/dto/medivet-search-admin-clinic.dto";
import { MedivetSearchClinicDto } from "@/medivet-clinics/dto/medivet-search-clinic.dto";
import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { AddressDto } from "@/medivet-commons/dto/address.dto";
import { MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { AddressCoordinates } from "@/medivet-commons/types";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Injectable()
export class MedivetClinicsService {
    constructor(
    @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>
    ) {
    }

    async createClinic(createClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        if (await this.checkIfClinicAlreadyExists(createClinicDto)) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CLINIC_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        const coordinates = await this.getClinicCoordinates(createClinicDto.address);

        const newClinic = this.clinicsRepository.create({
            name: createClinicDto.name,
            address: createClinicDto.address,
            phoneNumber: createClinicDto.phoneNumber,
            coordinates: coordinates || undefined
        });
        await this.clinicsRepository.save(newClinic);
        return newClinic;

    }

    async findClinicById(id: number, include?: string[]): Promise<MedivetClinic> {
        const clinic = await this.clinicsRepository.findOne({
            where: { id },
            relations: include ?? [],
        });

        if (!clinic) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.CLINIC_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }
        return clinic;
    }

    async findAllClinics(include?: string[]): Promise<MedivetClinic[]> {
        return this.clinicsRepository.find({ relations: include ?? [] });
    }

    async searchClinics(searchClinicDto: MedivetSearchAdminClinicDto): Promise<MedivetClinic[]> {
        let clinics = await this.findAllClinics(searchClinicDto?.include || []);

        if (searchClinicDto.search) {
            clinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(searchClinicDto.search.toLowerCase()));
        }

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

        return paginateData(clinics, {
            offset: searchClinicDto.offset,
            pageSize: searchClinicDto.pageSize,
        });
    }

    async removeClinic(clinicId: number): Promise<void> {
        const clinic = await this.findClinicById(clinicId);

        if (clinic) {
            const isClinicInUse = this.checkIfClinicIsInUse(clinic);
            if (isClinicInUse) {
                throw new BadRequestException([
                    {
                        message: ErrorMessagesConstants.CANNOT_REMOVE_VET_CLINIC_WHICH_IS_IN_USE,
                        property: "all"
                    }
                ]);
            }

            await this.clinicsRepository.remove(clinic);
        }
    }

    async updateClinic(clinicId: number, updateClinicDto: MedivetCreateClinicDto): Promise<MedivetClinic> {
        const clinic = await this.findClinicById(clinicId);
        const { address, name, phoneNumber } = updateClinicDto;
        const coordinates = await this.getClinicCoordinates(address);

        if (clinic) {
            clinic.address = { ...address };
            clinic.coordinates = coordinates ? { ...coordinates } : undefined;
            clinic.name = name;
            clinic.phoneNumber = phoneNumber;

            await this.clinicsRepository.save(clinic);
            return clinic;
        }
    }

    async getAssignedVetClinics(vetId: number, searchClinicDto: MedivetSearchClinicDto, include?: string[]): Promise<MedivetClinic[]> {
        let clinics = await this.clinicsRepository.find({
            where: { vets: { id: vetId } },
            relations: include ?? [],
        });

        if (searchClinicDto.search) {
            clinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(searchClinicDto.search.toLowerCase()));
        }

        return paginateData(clinics, {
            offset: searchClinicDto.offset,
            pageSize: searchClinicDto.pageSize
        });
    }

    checkIfClinicIsAlreadyAssignedToVet(clinic: MedivetClinic, vet: MedivetUser): boolean {
        return !!clinic.vets.find(clinicVet => clinicVet.id === vet.id);
    }

    async getNotAssignedVetClinics(user: MedivetUser, searchClinicDto: MedivetSearchClinicDto): Promise<MedivetClinic[]> {
        let clinics = await this.clinicsRepository.createQueryBuilder("clinic")
            .leftJoinAndSelect("clinic.vets", "vets").leftJoinAndSelect("clinic.clinicAssignmentRequests", "clinicAssignmentRequests")
            .where("vets.id IS NULL").leftJoinAndSelect("clinicAssignmentRequests.user", "clinicAssignmentRequestsUser")
            .getMany();

        if (searchClinicDto.search) {
            clinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(searchClinicDto.search.toLowerCase()));
        }

        return paginateData(clinics, {
            offset: searchClinicDto.offset,
            pageSize: searchClinicDto.pageSize,
        });
    }

    private async getClinicCoordinates(address: AddressDto): Promise<AddressCoordinates> {
        const query = `street=${address.street}+${address.buildingNumber}&city=${address.city}&postalcode=${address.zipCode}&format=json`;

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?${query}`);
            const data = response.data[0];
            const { lat, lon } = data;

            if (!lat || !lon) {
                throw new NotFoundException([
                    {
                        message: ErrorMessagesConstants.CANNOT_FIND_CLINIC_COORDINATES,
                        property: "all"
                    }
                ]);
            }

            return {
                lat,
                lon
            };
        } catch (err) {
            throw new InternalServerErrorException([
                {
                    message: "Internal Server Exception",
                    property: "all"
                }
            ]);
        }

    }

    private async checkIfClinicAlreadyExists(createClinicDto: MedivetCreateClinicDto): Promise<boolean> {
        const { name, address } = createClinicDto;
        const existingClinic = await this.clinicsRepository.findOne({ where: { name } });

        if (!existingClinic) return false;
        if (address.buildingNumber === existingClinic.address.buildingNumber &&
      address.city === existingClinic.address.city && address.street === existingClinic.address.street &&
      address.flatNumber === existingClinic.address.flatNumber) return true;
        return false;
    }

    private checkIfClinicIsInUse(clinic: MedivetClinic): boolean {
        return !!clinic.vets.find(vet => vet.id);
    }
}
