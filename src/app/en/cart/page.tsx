import { Metadata } from 'next';
import { CartPageView } from '@/views/CartPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shopping Bag',
  description: 'Review your floral arrangements and gifts in your shopping bag.',
  path: '/cart',
  locale: 'en',
  noIndex: true,
});

export default function EnglishCartPage() {
  return <CartPageView locale="en" />;
}
