'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type Variant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: Variant;
}

interface ToastContextValue {
  toast: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let nextId = 0;

const VARIANT_STYLES = {
  success: { border: 'rgba(16,185,129,.4)', color: '#10b981', Icon: Check },
  error: { border: 'rgba(239,68,68,.4)', color: '#ef4444', Icon: AlertCircle },
  info: { border: 'rgba(124,58,237,.4)', color: '#a78bfa', Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: Variant = 'success') => {
    const id = ++nextId;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed z-[9999] flex flex-col gap-2
                   right-4 top-16 md:right-6 md:top-20
                   max-md:left-4 max-md:right-4 max-md:top-auto max-md:bottom-[76px]"
      >
        {toasts.map((t) => {
          const s = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: '#16161e',
                border: `1px solid ${s.border}`,
                color: '#f0eeff',
                boxShadow: '0 8px 32px rgba(0,0,0,.5)',
              }}
            >
              <s.Icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((tt) => tt.filter((x) => x.id !== t.id))}
                className="opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
