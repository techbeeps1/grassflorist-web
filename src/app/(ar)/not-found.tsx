import Link from 'next/link';
import { Compass, Home, ShoppingBag } from 'lucide-react';

export default function ArabicNotFound() {
  return (
    <div className="py-20 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center bg-surface">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
        <Compass className="w-10 h-10 animate-pulse" />
      </div>

      <span className="text-sm font-bold tracking-widest text-secondary uppercase mb-2">
        خطأ 404 — الصفحة غير موجودة
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main mb-4">
        عفواً، لم نتمكن من العثور على هذه الصفحة
      </h1>
      <p className="text-text-muted max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        يبدو أن الرابط الذي تبحث عنه قد تم نقله أو تغييره، أو أن تنسيق الزهور هذا لم يعد متاحاً في الموسم الحالي.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-hover shadow-md hover:shadow-hover transition-all"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-subtle text-text-main font-medium text-sm border border-border hover:bg-surface hover:border-secondary transition-all"
        >
          <ShoppingBag className="w-4 h-4 text-secondary" />
          تصفح جميع الباقات
        </Link>
      </div>
    </div>
  );
}
