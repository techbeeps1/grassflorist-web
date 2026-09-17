import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy & Data Security | Grass Florist',
  description: 'Understand how Grass Florist safeguards customer personal data, anonymous gift recipients, and transaction privacy.',
  path: '/policies/privacy',
  locale: 'en',
});

export default function EnglishPrivacyPolicyPage() {
  return <PolicyPageView type="privacy" locale="en" />;
}
