import { MedivetUserRole } from '@/medivet-users/enums/medivet-user-role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const Role = (role: MedivetUserRole) => SetMetadata(ROLE_KEY, role);
