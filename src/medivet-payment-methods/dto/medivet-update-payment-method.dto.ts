import { MedivetPaymentMethodStatus } from "@/medivet-commons/enums/enums";
import { MedivetCreatePaymentMethodDto } from "@/medivet-payment-methods/dto/medivet-create-payment-method.dto";

export class MedivetUpdatePaymentMethodDto extends MedivetCreatePaymentMethodDto {
  status: MedivetPaymentMethodStatus;
}
