export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'DISPATCHER' | 'WAREHOUSE_OP' | 'FINANCE_OP' | 'VIEWER';

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
    entity: string; // e.g., 'SHIPMENT', 'INVOICE', 'USER'
    entityId?: string;
    metadata: Record<string, any>;
    ipAddress: string;
    status: 'SUCCESS' | 'FAILURE';
}

export interface TenantUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastLogin?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface SystemHealth {
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    uptime: string;
    apiLatencyMs: number;
    dbConnection: boolean;
}
