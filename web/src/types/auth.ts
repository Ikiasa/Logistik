
export interface User {
    id: string;
    email: string;
    tenantId: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
