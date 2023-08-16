import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { ROLE_KEY } from "@/medivet-users/decorators/medivet-role.decorator";
import { MedivetUserRole } from "@/medivet-users/enums/medivet-user-role.enum";

@Injectable()
export class MedivetRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRole = this.reflector.getAllAndOverride<MedivetUserRole>(ROLE_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredRole) return true;

        const request = context.switchToHttp().getRequest();
        return requiredRole === request.user.role;
    }
}
