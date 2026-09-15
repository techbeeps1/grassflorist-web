'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-[#16191D] font-sans p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-lg border border-black/5">
          <h1 className="text-2xl font-bold mb-4">حدث خطأ عام في النظام</h1>
          <p className="text-sm text-black/60 mb-6">
            A critical error occurred. Please try reloading the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0B382B] cursor-pointer"
          >
            إعادة المحاولة / Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
