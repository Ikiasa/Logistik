
import React from 'react';
import { usePermission, Role } from '@/hooks/usePermission';

interface CanProps {
    roles?: Role | Role[];
    perform?: string; // For future permission-based checks
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ roles, children, fallback = null }) => {
    const { hasRole } = usePermission();

    if (roles && !hasRole(roles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
