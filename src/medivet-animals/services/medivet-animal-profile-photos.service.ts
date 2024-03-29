import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";

@Injectable()
export class MedivetAnimalProfilePhotosService {
    constructor(@InjectRepository(MedivetAnimal) private animalRepository: Repository<MedivetAnimal>) {
    }

    async updateAnimalProfilePhoto(animal: MedivetAnimal, photoUrl: string): Promise<MedivetAnimal> {
        animal.profilePhotoUrl = photoUrl;
        await this.animalRepository.save(animal);
        return animal;
    }

    async removeAnimalProfilePhoto(animal: MedivetAnimal): Promise<MedivetAnimal> {
        animal.profilePhotoUrl = "";
        await this.animalRepository.save(animal);
        return animal;
    }
}
