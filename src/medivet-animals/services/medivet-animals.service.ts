import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetCreateAnimalDto } from "@/medivet-animals/dto/medivet-create-animal.dto";
import { MedivetSearchAnimalDto } from "@/medivet-animals/dto/medivet-search-animal.dto";
import { MedivetAnimal } from "@/medivet-animals/entities/medivet-animal.entity";
import { MedivetAnimalBreedsService } from "@/medivet-animals/services/medivet-animal-breeds.service";
import { MedivetAnimalCoatColorsService } from "@/medivet-animals/services/medivet-animal-coat-colors.service";
import { MedivetAppointmentsService } from "@/medivet-appointments/services/medivet-appointments.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { MedivetAnimalStatusEnum, MedivetSortingModeEnum } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";

@Injectable()
export class MedivetAnimalsService {
    constructor(
    @InjectRepository(MedivetAnimal) private animalsRepository: Repository<MedivetAnimal>,
    private animalBreedsService: MedivetAnimalBreedsService,
    private animalCoatColorsService: MedivetAnimalCoatColorsService,
    @Inject(forwardRef(() => MedivetAppointmentsService))
    private appointmentsService: MedivetAppointmentsService
    ) {
    }

    async createAnimal(createAnimalDto: MedivetCreateAnimalDto, owner: MedivetUser): Promise<MedivetAnimal> {
        this.validateAnimalBirthDate(createAnimalDto.birthDate);

        const breed = await this.animalBreedsService.findOneAnimalBreedById(createAnimalDto.breedId);
        const coatColor = await this.animalCoatColorsService.findOneAnimalCoatColorById(createAnimalDto.coatColorId);

        const newAnimal = this.animalsRepository.create({
            name: createAnimalDto.name,
            birthDate: createAnimalDto.birthDate,
            breed,
            gender: createAnimalDto.gender,
            type: createAnimalDto.type,
            coatColor,
            owner
        });
        await this.animalsRepository.save(newAnimal);
        const animalToReturn = { ...newAnimal };
        delete animalToReturn.coatColor;

        return animalToReturn;
    }

    async findOneAnimalById(id: number, include?: string): Promise<MedivetAnimal> {
        const animal = await this.animalsRepository.findOne(
            {
                where: { id },
                relations: include?.split(",") ?? []
            }
        );
        if (!animal) throw new NotFoundException(ErrorMessagesConstants.ANIMAL_WITH_THIS_ID_DOES_NOT_EXIST);
        return animal;
    }

    async searchAllAnimalsAssignedToOwner(user: MedivetUser, searchAnimalDto: MedivetSearchAnimalDto): Promise<MedivetAnimal[]> {
        let animals = await this.findAllAnimalsAssignedToOwner(user, searchAnimalDto?.include);

        if (searchAnimalDto.search) {
            animals = animals.filter(animal => animal.name.toLowerCase().includes(searchAnimalDto.search.toLowerCase()));
        }

        if (searchAnimalDto.sortingMode) {
            animals = animals.sort((a, b) => {
                const aName: string = a.name.toLowerCase();
                const bName: string = b.name.toLowerCase();

                switch (searchAnimalDto.sortingMode) {
                    case MedivetSortingModeEnum.ASC:
                        return aName.localeCompare(bName);
                    case MedivetSortingModeEnum.DESC:
                        return bName.localeCompare(aName);
                }
            });
        }

        if (searchAnimalDto.status) {
            switch (searchAnimalDto.status) {
                case MedivetAnimalStatusEnum.ACTIVE:
                    animals = animals.filter(animal => animal.status === MedivetAnimalStatusEnum.ACTIVE);
                    break;
                case MedivetAnimalStatusEnum.ARCHIVED:
                    animals = animals.filter(animal => animal.status === MedivetAnimalStatusEnum.ARCHIVED);
                    break;
                default:
                    break;
            }
        }

        return paginateData(animals, {
            offset: searchAnimalDto.offset,
            pageSize: searchAnimalDto.pageSize
        });
    }

    async updateAnimal(animalId: number, user: MedivetUser, updateAnimalDto: MedivetCreateAnimalDto): Promise<MedivetAnimal> {
        const animal = await this.findOneAnimalById(animalId, "owner,breed,coatColor");
        const { birthDate, breedId, coatColorId, gender, name, type } = updateAnimalDto;

        if (!this.checkIfUserIsAnimalOwner(user, animal)) throw new UnauthorizedException();
        this.validateAnimalBirthDate(updateAnimalDto.birthDate);

        const breed = await this.animalBreedsService.findOneAnimalBreedById(breedId);
        const coatColor = await this.animalCoatColorsService.findOneAnimalCoatColorById(coatColorId);

        animal.birthDate = birthDate;
        animal.breed = breed;
        animal.coatColor = coatColor;
        animal.gender = gender;
        animal.name = name;
        animal.type = type;

        await this.animalsRepository.save(animal);
        return animal;
    }

    checkIfUserIsAnimalOwner(user: MedivetUser, animal: MedivetAnimal): boolean {
        return user.id === animal.owner.id;
    }

    async archiveAnimal(animal: MedivetAnimal, user: MedivetUser): Promise<MedivetAnimal> {
        if (animal.owner.id !== user.id) throw new UnauthorizedException([ ErrorMessagesConstants.USER_IS_UNAUTHORIZED_TO_DO_THIS_ACTION ]);

        animal.status = MedivetAnimalStatusEnum.ARCHIVED;
        await this.animalsRepository.save(animal);

        await this.appointmentsService.cancelAllAnimalAppointments(animal.id);

        return animal;
    }

    async restoreAnimal(animal: MedivetAnimal, user: MedivetUser): Promise<MedivetAnimal> {
        if (animal.owner.id !== user.id) throw new UnauthorizedException([ ErrorMessagesConstants.USER_IS_UNAUTHORIZED_TO_DO_THIS_ACTION ]);

        animal.status = MedivetAnimalStatusEnum.ACTIVE;
        await this.animalsRepository.save(animal);
        return animal;
    }

    private validateAnimalBirthDate(birthDate: Date): void {
        if (birthDate >= new Date()) throw new BadRequestException(ErrorMessagesConstants.BIRTH_DATE_CANNOT_BE_LATER_THAN_TODAY);
    }

    private async findAllAnimalsAssignedToOwner(user: MedivetUser, include?: string): Promise<MedivetAnimal[]> {
        return this.animalsRepository.find(
            {
                where: { owner: { id: user.id } },
                relations: include?.split(",") ?? []
            }
        );
    }

}
