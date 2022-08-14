import { MedivetSecurityHashingService } from "@/medivet-security/services/medivet-security-hashing.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [MedivetSecurityHashingService],
    exports: [MedivetSecurityHashingService]
})

export class MedivetSecurityModule {}