import { MedivetVetSpecializationMedicalServiceController } from '@/medivet-specializations/controllers/medivet-vet-specialization-medical-service.controller';
import { MedivetVetSpecializationController } from '@/medivet-specializations/controllers/medivet-vet-specializations.controllers';
import { MedivetVetSpecializationMedicalService } from "@/medivet-specializations/entities/medivet-vet-specialization-medical-service.entity";
import { MedivetVetSpecialization } from '@/medivet-specializations/entities/medivet-vet-specialization.entity';
import { MedivetVetSpecializationMedicalServiceService } from "@/medivet-specializations/services/medivet-vet-specialization-medical-service.service";
import { MedivetVetSpecializationService } from '@/medivet-specializations/services/medivet-vet-specialization.service';
import { MedivetUser } from '@/medivet-users/entities/medivet-user.entity';
import { MedivetUsersModule } from '@/medivet-users/medivet-users.module';
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedivetVetSpecialization,
            MedivetVetSpecializationMedicalService,
            MedivetUser
        ]),
        forwardRef(() => MedivetUsersModule),
    ],
    controllers: [MedivetVetSpecializationMedicalServiceController, MedivetVetSpecializationController],
    providers: [MedivetVetSpecializationMedicalServiceService, MedivetVetSpecializationService],
    exports: [MedivetVetSpecializationService]
})

export class MedivetVetSpecializationsModule { }