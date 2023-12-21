import { SetMetadata } from "@nestjs/common";

import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

export const ROLE_KEY = "role";
export const Role = (roles: MedivetUserRole[]) => SetMetadata(ROLE_KEY, roles);
