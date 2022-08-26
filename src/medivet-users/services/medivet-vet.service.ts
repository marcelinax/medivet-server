import { Injectable } from "@nestjs/common";
import { MedivetVetSpecializationService } from '@/medivet-users/services/medivet-vet-specialization.service';

@Injectable()
export class MedivetVetService {
    constructor(
        private vetSpecializationService: MedivetVetSpecializationService
    ) {}
}