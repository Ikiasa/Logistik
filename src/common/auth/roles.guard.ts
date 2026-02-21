import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User authentication required');
        }

        // Roles in user object from JwtMockStrategy (passed during validate)
        const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

        if (!hasRole) {
            throw new ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
        }

        return true;
    }
}
