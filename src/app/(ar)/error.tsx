'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ArabicErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error for telemetry/monitoring
    console.error('Arabic Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center bg-surface">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4 ring-8 ring-danger/5">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-3">
        حدث خطأ غير متوقع
      </h1>
      <p className="text-text-muted max-w-md mb-8 text-sm leading-relaxed">
        نعتذر عن هذا الخلل المؤقت. تم تسجيل الخطأ وسيعمل فريقنا الفني على معالجته فوراً. يمكنك محاولة إعادة تحميل الصفحة.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-hover shadow-md transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}
