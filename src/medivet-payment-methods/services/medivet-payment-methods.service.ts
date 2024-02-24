import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetPaymentMethodStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetCreatePaymentMethodDto } from "@/medivet-payment-methods/dto/medivet-create-payment-method.dto";
import { MedivetUpdatePaymentMethodDto } from "@/medivet-payment-methods/dto/medivet-update-payment-method.dto";
import { MedivetPaymentMethod } from "@/medivet-payment-methods/entities/medivet-payment-method.entity";

@Injectable()
export class MedivetPaymentMethodsService {
    constructor(
    @InjectRepository(MedivetPaymentMethod) private paymentMethodRepository: Repository<MedivetPaymentMethod>,
    ) {
    }

    async createPaymentMethod(createPaymentMethodDto: MedivetCreatePaymentMethodDto): Promise<MedivetPaymentMethod> {
        const { name } = createPaymentMethodDto;

        await this.checkIfPaymentMethodAlreadyExists(name);

        const paymentMethod = this.paymentMethodRepository.create({ name });
        await this.paymentMethodRepository.save(paymentMethod);

        return paymentMethod;
    }

    async findPaymentMethodById(id: number): Promise<MedivetPaymentMethod> {
        const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });

        if (!paymentMethod) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.PAYMENT_METHOD_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }

        return paymentMethod;
    }

    async searchPaymentMethods(
        paginationDto: OffsetPaginationDto,
        status: MedivetPaymentMethodStatus
    ): Promise<MedivetPaymentMethod[]> {
        let paymentMethods = await this.paymentMethodRepository.find();

        if (status) {
            paymentMethods = paymentMethods.filter(paymentMethod => paymentMethod.status === status);
        }

        return paginateData(paymentMethods, paginationDto);
    }

    async removePaymentMethod(id: number): Promise<OkMessageDto> {
        const paymentMethod = await this.findPaymentMethodById(id);
        await this.paymentMethodRepository.remove(paymentMethod);

        return { message: SuccessMessageConstants.PAYMENT_METHOD_HAS_BEEN_REMOVED_SUCCESSFULLY };
    }

    async updatePaymentMethod(
        id: number,
        updatePaymentMethodDto: MedivetUpdatePaymentMethodDto
    ): Promise<MedivetPaymentMethod> {
        const { status, name } = updatePaymentMethodDto;
        const paymentMethod = await this.findPaymentMethodById(id);
        await this.checkIfPaymentMethodAlreadyExists(name);

        paymentMethod.status = status;
        paymentMethod.name = name;
        await this.paymentMethodRepository.save(paymentMethod);

        return paymentMethod;
    }

    private async checkIfPaymentMethodAlreadyExists(name: string): Promise<void> {
        const paymentMethod = await this.paymentMethodRepository.findOne({ where: { name } });

        if (paymentMethod) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.PAYMENT_METHOD_WITH_NAME_ALREADY_EXISTS,
                    property: "name"
                }
            ]);
        }
    }
}
