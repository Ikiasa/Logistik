
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Toast, ToastType } from '@/components/ui/Toast';

export const LoginForm: React.FC = () => {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [tokenInput, setTokenInput] = useState('valid-token-tenant-a');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/sso', {}, {
                headers: { 'x-sso-token': tokenInput }
            });
            login(res.data.accessToken, res.data.user);
            setToast({ message: 'Success! Redirecting...', type: 'success' });

            // Delay for UX
            setTimeout(() => router.push('/dashboard'), 1000);
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || 'Login Failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to Logistik</h2>
            <p className="text-zinc-500 mb-8">Enter your SSO trial token to access the console.</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">SSO Trial Token</label>
                    <select
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                        <option value="valid-token-tenant-a">Tenant A (Alice)</option>
                        <option value="valid-token-tenant-b">Tenant B (Bob)</option>
                        <option value="invalid">Invalid Token (Test Error)</option>
                    </select>
                </div>

                <Button type="submit" isLoading={loading} className="w-full py-3">
                    Access Console
                </Button>
            </form>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
