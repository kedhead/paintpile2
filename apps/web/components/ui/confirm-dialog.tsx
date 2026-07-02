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
          className="animate-fade-in fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-up w-full max-w-sm rounded-2xl border border-edge bg-surface p-6 shadow-vault-lg"
          >
            <h2 className="mb-2 text-base font-bold text-ink">
              {state.opts.title}
            </h2>
            {state.opts.message && (
              <p className="mb-5 text-sm text-ink-muted">
                {state.opts.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="rounded-xl border border-edge-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white/5"
              >
                {state.opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => close(true)}
                className={
                  state.opts.destructive
                    ? 'rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,.3)] transition-all hover:bg-danger/85'
                    : 'rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-glow-violet transition-all hover:bg-primary-hover'
                }
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
