import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms & Conditions',
  description: 'General terms and conditions governing Florelle online boutique services and orders.',
  path: '/policies/terms',
  locale: 'en',
});

export default function EnglishTermsPolicyPage() {
  return <PolicyPageView type="terms" locale="en" />;
}
