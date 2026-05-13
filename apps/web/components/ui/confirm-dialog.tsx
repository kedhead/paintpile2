'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmOpts {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    opts: ConfirmOpts;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOpts) =>
      new Promise<boolean>((resolve) => setState({ opts, resolve })),
    []
  );

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4"
          onClick={() => close(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border p-6"
            style={{
              background: '#16161e',
              borderColor: 'rgba(255,255,255,.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,.6)',
            }}
          >
            <h2 className="mb-2 text-base font-bold" style={{ color: '#f0eeff' }}>
              {state.opts.title}
            </h2>
            {state.opts.message && (
              <p className="mb-5 text-sm" style={{ color: '#7a7898' }}>
                {state.opts.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,.1)', color: '#f0eeff' }}
              >
                {state.opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => close(true)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all"
                style={{
                  background: state.opts.destructive ? '#ef4444' : '#7c3aed',
                  boxShadow: state.opts.destructive
                    ? '0 0 20px rgba(239,68,68,.3)'
                    : '0 0 20px rgba(124,58,237,.3)',
                }}
              >
                {state.opts.confirmLabel ||
                  (state.opts.destructive ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
