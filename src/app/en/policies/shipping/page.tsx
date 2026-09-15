import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Cold-Chain Delivery & Shipping Policy',
  description: 'Learn about our temperature-controlled fleet (16-18°C) and guaranteed same-day 3-hour courier service in Riyadh, Jeddah & Khobar.',
  path: '/policies/shipping',
  locale: 'en',
});

export default function EnglishShippingPolicyPage() {
  return <PolicyPageView type="shipping" locale="en" />;
}
