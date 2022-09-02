import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MedivetPriceList } from '@/medivet-price-lists/entities/medivet-price-list.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetCreatePriceListDto } from '@/medivet-price-lists/dto/medivet-create-price-list.dto';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { ErrorMessagesConstants } from '@/medivet-commons/constants/error-messages.constants';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';

@Injectable()
export class MedivetPriceListsService {
    constructor(
        @InjectRepository(MedivetPriceList) private priceListsRepository: Repository<MedivetPriceList>,
        private usersService: MedivetUsersService
    ) { }
    
    async createPriceList(vet: MedivetUser, createPriceListDto: MedivetCreatePriceListDto): Promise<MedivetPriceList> {
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

        const vetClinic = vet.clinics.find(clinic => clinic.id === clinicId);
        if (!vetClinic) {
            throw new NotFoundException([ErrorMessagesConstants.VET_CLINIC_IS_NOT_ASSIGNED_TO_THIS_VET]);
        }

        const newPriceList = this.priceListsRepository.create({
            clinic: vetClinic,
            vet,
            specialization: vetSpecialization,
            purposes: []
        });

        await this.priceListsRepository.save(newPriceList, {});
        return newPriceList;
    }
}