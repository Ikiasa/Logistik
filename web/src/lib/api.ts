
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api', // Vercel: relative path
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use((config) => {
    // 1. Auto-attach Bearer Token with Cookie Fallback
    const state = useAuthStore.getState();
    const token = state.token || Cookies.get('auth-token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Idempotency-Key
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        if (!config.headers['Idempotency-Key']) {
            config.headers['Idempotency-Key'] = uuidv4();
        }
    }

    return config;
});

// Response Interceptor for Enterprise Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        const config = error.config; // Added to access request config

        switch (status) {
            case 401:
                // Prevent auto-logout loop if we are already on the login page or checking auth
                const isAuthRoute = config.url?.includes('/auth/');

                if (!isAuthRoute) {
                    console.error('Session Expired: Redirecting to login.');
                    useAuthStore.getState().logout();
                    if (typeof window !== 'undefined') window.location.href = '/login';
                }
                break;
            case 403:
                console.error('RLS Policy Violation: Access Denied to this resource.');
                break;
            case 409:
                console.warn('Idempotent Conflict: Request already processed safely.');
                break;
            default:
                console.error(`API Error [${status}]: ${message}`);
        }

        return Promise.reject(error);
    }
);

export default api;
