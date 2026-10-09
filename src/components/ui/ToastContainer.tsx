'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeToast, ToastNotification } from '@/store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToastItem({ toast }: { toast: ToastNotification }) {
  const dispatch = useAppDispatch();

  // Auto-close toast after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 shadow-emerald-950/10',
    error: 'border-rose-200/90 bg-rose-50/95 text-rose-950 shadow-rose-950/10',
    info: 'border-blue-200/90 bg-blue-50/95 text-blue-950 shadow-blue-950/10',
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto relative overflow-hidden flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 w-full sm:w-[380px] max-w-full box-border',
        borders[toast.type]
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span className="mt-0.5">{icons[toast.type]}</span>
        <span className="text-xs sm:text-sm font-semibold leading-relaxed break-words">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="p-1 rounded-lg hover:bg-black/10 active:scale-95 transition-all cursor-pointer shrink-0 text-current/70 hover:text-current mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Subtle bottom progress line */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black/10 overflow-hidden">
        <div
          className="h-full bg-current opacity-40 transition-all ease-linear"
          style={{
            animation: 'toastProgress 4.5s linear forwards',
          }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-20 sm:top-24 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </aside>
  );
}

