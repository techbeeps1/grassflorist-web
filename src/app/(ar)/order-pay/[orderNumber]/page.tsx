import { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderPayView } from '@/views/OrderPayView';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return generatePageMetadata({
    title: `سداد قيمة الطلب #${orderNumber}`,
    description: 'بوابة دفع آمنة لسداد قيمة الطلب عبر بطاقة مدى، البطاقات الائتمانية، أو تابي.',
    path: `/order-pay/${orderNumber}`,
    locale: 'ar',
    noIndex: true,
  });
}

export default async function ArabicOrderPayPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const decodedOrderNumber = decodeURIComponent(orderNumber);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8fae2a] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OrderPayView orderNumber={decodedOrderNumber} locale="ar" />
    </Suspense>
  );
}
