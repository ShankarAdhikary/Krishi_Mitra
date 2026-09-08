import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/95 border-emerald-600 text-white';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900/95 border-rose-600 text-white';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900/95 border-amber-600 text-white';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-xs text-xs animate-in slide-in-from-bottom-2 duration-150 ${bg}`}
          >
            <Icon className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white shrink-0 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
