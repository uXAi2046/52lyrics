import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'neutral';
interface ToastAction { label: string; onClick: () => void }
interface ToastMessage { id: number; message: string; tone: ToastTone; action?: ToastAction }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone, action?: ToastAction) => void }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = 'neutral', action?: ToastAction) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone, action }].slice(-3));
    window.setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.tone}`} key={toast.id} role="status">
            {toast.tone === 'error' ? <CircleAlert aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" className="toast__action" onClick={() => {
                toast.action?.onClick();
                dismiss(toast.id);
              }}>{toast.action.label}</button>
            )}
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss message">
              <X aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider.');
  return context;
}
