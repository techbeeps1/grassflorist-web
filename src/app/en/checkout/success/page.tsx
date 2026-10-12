import { Metadata } from 'next';
import { CheckoutPageView } from '@/views/CheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Order Received Successfully',
  description: 'Your order details after payment completion.',
  path: '/en/checkout/success',
  locale: 'en',
  noIndex: true,
});

export default function EnglishCheckoutSuccessPage() {
  return <CheckoutPageView locale="en" />;
}
