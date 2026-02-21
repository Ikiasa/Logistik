
import { useAuthStore } from '../store/authStore';

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    FINANCE = 'FINANCE',
    DISPATCHER = 'DISPATCHER',
    DRIVER = 'DRIVER',
    AUDITOR = 'AUDITOR'
}

export const usePermission = () => {
    const { user } = useAuthStore();

    const hasRole = (roles: Role | Role[]) => {
        if (!user || !user.roles) return false;
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        // For Enterprise efficiency, SUPER_ADMIN bypasses all checks
        if (user.roles.includes(Role.SUPER_ADMIN)) return true;
        return requiredRoles.some(role => user.roles.includes(role));
    };

    return {
        roles: user?.roles || [],
        hasRole,
        isSuperAdmin: !!user?.roles?.includes(Role.SUPER_ADMIN),
        isFinance: !!user?.roles?.includes(Role.FINANCE),
        isDispatcher: !!user?.roles?.includes(Role.DISPATCHER),
        isDriver: !!user?.roles?.includes(Role.DRIVER),
        isAuditor: !!user?.roles?.includes(Role.AUDITOR),
    };
};
