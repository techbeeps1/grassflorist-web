import { Metadata } from 'next';
import { CheckoutPageView } from '@/views/CheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Secure Checkout',
  description: 'Complete your delivery and payment details for handcrafted floral arrangements.',
  path: '/checkout',
  locale: 'en',
  noIndex: true,
});

export default function EnglishCheckoutPage() {
  return <CheckoutPageView locale="en" />;
}
