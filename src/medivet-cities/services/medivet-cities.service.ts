import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetClinic } from "@/medivet-clinics/entities/medivet-clinic.entity";
import { OffsetPaginationDto } from "@/medivet-commons/dto/offset-pagination.dto";
import { paginateData } from "@/medivet-commons/utils";

@Injectable()
export class MedivetCitiesService {
    constructor(
    @InjectRepository(MedivetClinic) private clinicsRepository: Repository<MedivetClinic>
    ) {
    }

    async getCities(
        paginationDto: OffsetPaginationDto,
        search?: string
    ): Promise<string[]> {
        const clinics = await this.clinicsRepository.find();
        let cities: string[] = [];

        clinics.forEach(clinic => {
            const { address: { city } } = clinic;
            if (!cities.includes(city.trim())) {
                cities.push(city.trim());
            }
        });

        if (search) {
            cities = cities.filter(city => city.toLowerCase().includes(search.toLowerCase()));
        }

        return paginateData(cities, paginationDto);
    }

}
