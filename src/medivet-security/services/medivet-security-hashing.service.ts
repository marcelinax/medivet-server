import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class MedivetSecurityHashingService {
   async hashValue(value: string): Promise<string> {
       const saltOrRounds = 10;
       return bcrypt.hash(value, saltOrRounds);
    }

    validateHashingValue(value: string, hash: string): Promise<boolean> {
        return bcrypt.compare(value, hash);
    }
}