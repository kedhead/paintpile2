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
  success: { border: 'border-success/40', color: 'text-success', Icon: Check },
  error: { border: 'border-danger/40', color: 'text-danger', Icon: AlertCircle },
  info: { border: 'border-primary/40', color: 'text-primary-tint', Icon: Info },
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
              className={`animate-fade-up pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-vault-lg ${s.border}`}
            >
              <s.Icon className={`h-4 w-4 shrink-0 ${s.color}`} />
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
