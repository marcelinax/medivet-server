import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { Repository } from 'typeorm';

@Injectable()
export class MedivetUserProfilePhotosService {
    constructor(@InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>) { }
    
    async updateUserProfilePhoto(user: MedivetUser, photoUrl: string): Promise<MedivetUser> {
        user.profilePhotoUrl = photoUrl;
        await this.usersRepository.save(user);
        return user;
    }

    async removeUserProfilePhoto(user: MedivetUser): Promise<MedivetUser> {
        user.profilePhotoUrl = '';
        await this.usersRepository.save(user);
        return user;
    }
}