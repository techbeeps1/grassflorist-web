import { Metadata } from 'next';
import { CheckoutPageView } from '@/views/CheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'إتمام عملية الشراء والدفع',
  description: 'أكمل بيانات التوصيل والدفع لطلب باقات الزهور والهدايا الفاخرة.',
  path: '/checkout',
  locale: 'ar',
  noIndex: true, // Excluded from indexing
});

export default function ArabicCheckoutPage() {
  return <CheckoutPageView locale="ar" />;
}
