import { Metadata } from 'next';
import { FaqPageView } from '@/views/FaqPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Frequently Asked Questions | Delivery, Floral Care & Guarantee',
  description: 'Comprehensive guidance on express 2-hour delivery, floral care instructions, payments, and 7-day guarantee.',
  path: '/faq',
  locale: 'en',
});

export default function EnglishFaqPage() {
  return <FaqPageView locale="en" />;
}
