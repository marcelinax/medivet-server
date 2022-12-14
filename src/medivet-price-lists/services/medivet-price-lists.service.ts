import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MedivetPriceList } from '@/medivet-price-lists/entities/medivet-price-list.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetCreatePriceListDto } from '@/medivet-price-lists/dto/medivet-create-price-list.dto';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { ErrorMessagesConstants } from '@/medivet-commons/constants/error-messages.constants';
import { MedivetGetMyPriceListDto } from '@/medivet-price-lists/dto/medivet-get-my-price-list.dto';
import { MedivetAssignAppointmentPurposesToPriceListDto } from '@/medivet-price-lists/dto/medivet-assign-appointment-purposes-to-price-list.dto';
import { MedivetAppointmentPurposesService } from '@/medivet-appointments/services/medivet-appointment-purposes.service';
import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';

@Injectable()
export class MedivetPriceListsService {
    constructor(
        @InjectRepository(MedivetPriceList) private priceListsRepository: Repository<MedivetPriceList>,
        private appointmentPurposesService: MedivetAppointmentPurposesService
    ) { }
    
    async createPriceList(vet: MedivetUser, createPriceListDto: MedivetCreatePriceListDto): Promise<Partial<MedivetPriceList>> {
        const { clinicId, specializationId } = createPriceListDto;

        const vetSpecialization = vet.specializations.find(spec => spec.id === specializationId);
        if (!vetSpecialization) {
            throw new NotFoundException([ErrorMessagesConstants.VET_SPECIALIZATION_IS_NOT_ASSIGNED_TO_THIS_VET]);
        }

        const possiblePriceListWithThisSpecialization = vet.priceLists.find(priceList => priceList.specialization.id === specializationId);
        const possiblePriceListWithThisClinic = vet.priceLists.find(priceList => priceList.clinic.id === clinicId);
        if (possiblePriceListWithThisSpecialization && possiblePriceListWithThisClinic) {
            throw new BadRequestException([ErrorMessagesConstants.PRICE_LIST_FOR_THIS_SPECIALIZATION_AND_CLINIC_IN_VET_PRICE_LISTS_ALREADY_EXISTS]);
        }

        const vetClinic = vet.clinics.find(clinic => clinic.clinic.id === clinicId);
        if (!vetClinic) {
            throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
        }

        const newPriceList = this.priceListsRepository.create({
            clinic: vetClinic.clinic,
            vet, 
            specialization: vetSpecialization,
            purposes: []
        });
        await this.priceListsRepository.save(newPriceList);
        const { clinic, vet: _vet, ...rest } = newPriceList;
        
        return rest;
    }

    async findMyPriceList(priceListId: number, vet: MedivetUser, getMyPriceListDto: MedivetGetMyPriceListDto): Promise<MedivetPriceList> {
        const priceList = await this.priceListsRepository.findOne({
            where: { id: priceListId },
            relations: [
                'purposes',
                'clinic',
                'vet',
                'specialization'
            ]
        });

        const { clinicId, specializationId } = getMyPriceListDto;
        if (priceList) {
            if (+priceList.clinic.id !== +clinicId
                || +priceList.specialization.id !== +specializationId
                || +priceList.vet.id !== +vet.id) {
                    throw new NotFoundException([ErrorMessagesConstants.PRICE_LIST_WITH_SUCH_PARAMS_DOES_NOT_EXIST]);
                }
            
            return priceList;
        }
        throw new NotFoundException([ErrorMessagesConstants.PRICE_LIST_DOES_NOT_EXIST]);
    }

    async assignAppointmentPurposesToPriceList(
        vet: MedivetUser, priceListId: number, assignAppointmentPurposesToPriceListDto: MedivetAssignAppointmentPurposesToPriceListDto
    ): Promise<MedivetPriceList> {
        const { clinicId, purposesIds, specializationId } = assignAppointmentPurposesToPriceListDto;

        const priceList = await this.findMyPriceList(priceListId, vet, { clinicId, specializationId });

        if (priceList) {
            const purposes = [];
            for (let i = 0; i < purposesIds.length; i++) {
                const purposeId = purposesIds[i];
                const purposeFoundById = await this.appointmentPurposesService.findAppointmentPurposeById(purposeId);
         
                if (purposeFoundById) {
                    const vetPurpose = await this.appointmentPurposesService.findVetAppointmentPurpose(vet.id, clinicId, purposeFoundById.name);
                    if (vetPurpose) purposes.push(vetPurpose);
                    else throw new NotFoundException([ErrorMessagesConstants.APPOINTMENT_PURPOSE_DOES_NOT_EXIST]);
                }
            }

            priceList.purposes = [...purposes];
            await this.priceListsRepository.save(priceList);
            return priceList;
        }
    }

    async findAllMyPriceLists(vet: MedivetUser, offsetPaginationDto: OffsetPaginationDto): Promise<MedivetPriceList[]> {
        const priceLists = await this.priceListsRepository.find({
            where: {
                vet: { id: vet.id },
            },
            relations: [
                'purposes',
                'clinic',
                'specialization'
            ]
        });

        const pageSize = offsetPaginationDto.pageSize || 10;
        const offset = offsetPaginationDto.offset || 0;

        return this.paginatePriceLists(priceLists, pageSize, offset);
    }

    async findAllMyPriceListsRelatedWithClinic(vet: MedivetUser, clinicId: number, offsetPaginationDto: OffsetPaginationDto): Promise<MedivetPriceList[]> {
        const priceLists = await this.priceListsRepository.find({
            where: {
                vet: { id: vet.id },
                clinic: {id: clinicId}
            },
            relations: [
                'purposes',
                'clinic',
                'specialization'
            ]
        });

        const pageSize = offsetPaginationDto.pageSize || 10;
        const offset = offsetPaginationDto.offset || 0;

        return this.paginatePriceLists(priceLists, pageSize, offset);
    }

    private paginatePriceLists(priceLists: MedivetPriceList[], pageSize: number, offset: number): MedivetPriceList[] {
        return priceLists.filter((_, index) => index >= offset && index < offset + pageSize);
    }
}