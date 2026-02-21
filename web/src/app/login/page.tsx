
'use client';

import { LoginForm } from '@/modules/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6 font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                    <span className="text-2xl font-bold tracking-tight text-white uppercase">Logistik</span>
                </div>

                <LoginForm />

                <p className="mt-8 text-zinc-600 text-sm">
                    &copy; 2026 Logistik Enterprise
                </p>
            </div>
        </div>
    );
}
