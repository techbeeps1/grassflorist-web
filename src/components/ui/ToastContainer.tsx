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
      className="fixed bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:start-6 sm:w-auto sm:max-w-sm z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 shadow-emerald-950/5',
          error: 'border-rose-200/90 bg-rose-50/95 text-rose-950 shadow-rose-950/5',
          info: 'border-blue-200/90 bg-blue-50/95 text-blue-950 shadow-blue-950/5',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all animate-slide-up w-full max-w-full box-border',
              borders[toast.type]
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {icons[toast.type]}
              <span className="text-xs sm:text-sm font-semibold leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="p-1 rounded-lg hover:bg-black/5 active:scale-95 transition-all cursor-pointer shrink-0 text-current/70 hover:text-current"
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
