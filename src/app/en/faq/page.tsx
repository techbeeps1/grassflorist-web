import { Metadata } from 'next';
import { FaqPageView } from '@/views/FaqPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getFaqs } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'Frequently Asked Questions | Delivery, Floral Care & Guarantee',
  description: 'Comprehensive guidance on express 2-hour delivery, floral care instructions, payments, and 7-day guarantee.',
  path: '/faq',
  locale: 'en',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EnglishFaqPage() {
  const faqs = await getFaqs('en');
  return <FaqPageView locale="en" faqs={faqs} />;
}
