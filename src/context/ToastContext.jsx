import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    addToast(message, type, duration);
  }, [addToast]);

  const toastMethods = {
    showToast,
    addToast,
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => {
          let bg = 'bg-white border-l-4 border-emerald-500 text-slate-800 shadow-xl';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;

          if (t.type === 'error') {
            bg = 'bg-white border-l-4 border-rose-500 text-slate-800 shadow-xl';
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-white border-l-4 border-amber-500 text-slate-800 shadow-xl';
            icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          } else if (t.type === 'info') {
            bg = 'bg-white border-l-4 border-blue-500 text-slate-800 shadow-xl';
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`${bg} p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3 pointer-events-auto transition-all animate-in slide-in-from-top-2 duration-200`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="text-xs font-semibold leading-snug break-words">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if accessed before ToastProvider is initialized
    return {
      showToast: (msg) => console.log('[Toast]:', msg),
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      info: (msg) => console.log('[Toast Info]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
    };
  }
  return context;
}
