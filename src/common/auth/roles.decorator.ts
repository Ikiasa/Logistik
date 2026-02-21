import { SetMetadata } from '@nestjs/common';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    FINANCE = 'FINANCE',
    DISPATCHER = 'DISPATCHER',
    DRIVER = 'DRIVER',
    AUDITOR = 'AUDITOR'
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
