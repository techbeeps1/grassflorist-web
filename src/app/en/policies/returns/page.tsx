import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Freshness Guarantee & Returns Policy',
  description: 'Florelle 7-day botanical freshness guarantee, replacement terms, and refund policy.',
  path: '/policies/returns',
  locale: 'en',
});

export default function EnglishReturnsPolicyPage() {
  return <PolicyPageView type="returns" locale="en" />;
}
