import { Metadata } from 'next';
import { CheckoutPageView } from '@/views/CheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'تم استلام الطلب بنجاح',
  description: 'تفاصيل طلبك بعد إتمام عملية الدفع.',
  path: '/checkout/success',
  locale: 'ar',
  noIndex: true,
});

export default function ArabicCheckoutSuccessPage() {
  return <CheckoutPageView locale="ar" />;
}
