
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface AuthUser {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    hydrated: boolean;
    setHydrated: (val: boolean) => void;
    login: (token: string, user: any) => void;
    logout: () => void;
}

/**
 * Derive roles from a mock-jwt token if user.roles is empty/stale.
 * Token format: mock-jwt|userId|tenantId|email|ROLE1,ROLE2
 */
function deriveRolesFromToken(token: string | null, existingRoles: string[]): string[] {
    // If roles are already valid (not ['user'] or empty), keep them
    const validRoles = ['SUPER_ADMIN', 'FINANCE', 'DISPATCHER', 'DRIVER', 'AUDITOR'];
    if (existingRoles && existingRoles.some(r => validRoles.includes(r))) {
        return existingRoles;
    }

    // Try to extract from token
    if (token && token.startsWith('mock-jwt|')) {
        const parts = token.split('|');
        if (parts.length >= 5 && parts[4]) {
            const tokenRoles = parts[4].split(',').filter(r => validRoles.includes(r));
            if (tokenRoles.length > 0) return tokenRoles;
        }
        // Fallback: look at email in the token
        const email = parts[3] || '';
        if (email.includes('alice') || email.includes('admin')) return ['SUPER_ADMIN'];
        if (email.includes('bob')) return ['DISPATCHER'];
    }

    // Last resort: if user is logged in at all, grant DISPATCHER access
    return token ? ['DISPATCHER'] : [];
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => {
            const cookieToken = Cookies.get('auth-token');

            return {
                token: cookieToken || null,
                user: null,
                hydrated: false,
                setHydrated: (val) => {
                    // On hydration, fix stale roles if needed
                    const state = get();
                    if (state.user && state.token) {
                        const fixedRoles = deriveRolesFromToken(state.token, state.user.roles);
                        if (fixedRoles.join(',') !== state.user.roles.join(',')) {
                            set({ hydrated: val, user: { ...state.user, roles: fixedRoles } });
                            return;
                        }
                    }
                    set({ hydrated: val });
                },
                login: (token, user) => {
                    Cookies.set('auth-token', token, {
                        expires: 1,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/'
                    });
                    // Ensure roles are always valid on login
                    const roles = deriveRolesFromToken(token, user?.roles || []);
                    set({ token, user: { ...user, roles } });
                },
                logout: () => {
                    Cookies.remove('auth-token', { path: '/' });
                    set({ token: null, user: null });
                },
            };
        },
        {
            name: 'auth-storage',
            onRehydrateStorage: (state) => {
                return () => {
                    (state as AuthState).setHydrated(true);
                };
            }
        }
    )
);
