import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MedivetPriceList } from '@/medivet-price-lists/entities/medivet-price-list.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MedivetCreatePriceListDto } from '@/medivet-price-lists/dto/medivet-create-price-list.dto';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { ErrorMessagesConstants } from '@/medivet-commons/constants/error-messages.constants';
import { MedivetUsersService } from '@/medivet-users/services/medivet-users.service';
import { MedivetGetMyPriceListDto } from '@/medivet-price-lists/dto/medivet-get-my-price-list.dto';

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
}