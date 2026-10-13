import { Suspense } from 'react';
import { SubscribeCheckoutPageView } from '@/views/SubscribeCheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata({
    title: 'إتمام دفع وتأكيد الاشتراك الدوري',
    description: 'أتمم طلب اشتراك الزهور الطبيعية مع وسائل الدفع الآمنة والتوصيل المجاني داخل جدة.',
    path: '/subscribe-checkout',
    locale: 'ar',
  });
}

export default function ArabicSubscribeCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#2D3F33] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SubscribeCheckoutPageView locale="ar" />
    </Suspense>
  );
}
