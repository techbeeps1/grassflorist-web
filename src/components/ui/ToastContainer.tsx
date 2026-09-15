'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeToast } from '@/store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 start-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
          error: 'border-rose-200 bg-rose-50 text-rose-950',
          info: 'border-blue-200 bg-blue-50 text-blue-950',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg transition-all animate-slide-up',
              borders[toast.type]
            )}
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type]}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="p-1 hover:opacity-70 ms-3 cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
