
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const types = {
        success: "bg-green-500/10 border-green-500/50 text-green-500",
        error: "bg-red-500/10 border-red-500/50 text-red-500",
        warning: "bg-amber-500/10 border-amber-500/50 text-amber-500",
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl border ${types[type]} shadow-2xl animate-in slide-in-from-right-full`}>
            <div className="flex items-center gap-3">
                <span>{message}</span>
                <button onClick={onClose} className="hover:opacity-70">&times;</button>
            </div>
        </div>
    );
};
