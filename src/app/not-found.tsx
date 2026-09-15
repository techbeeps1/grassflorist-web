import Link from 'next/link';
import { cairo } from './fonts';
import './globals.css';

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#16191D] font-sans p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-lg border border-black/5">
          <div className="w-16 h-16 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            404
          </div>
          <h1 className="text-2xl font-bold mb-3">الصفحة غير موجودة | Page Not Found</h1>
          <p className="text-sm text-black/60 mb-8 leading-relaxed">
            لم يتم العثور على الصفحة المطلوبة. يرجى الاختيار للمتابعة:
            <br />
            The page you requested could not be found. Please select an option:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0B382B] transition-colors"
            >
              الرئيسية (العربية)
            </Link>
            <Link
              href="/en"
              className="px-6 py-3 rounded-full bg-[#FAF8F5] text-[#16191D] border border-black/10 text-sm font-semibold hover:bg-[#F2EFE9] transition-colors"
            >
              English Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
