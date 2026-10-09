import { Metadata } from 'next';
import { PartnerWithUsPageView } from '@/views/PartnerWithUsPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Partner With Us | Brand Onboarding & Vendor Collaboration | Grass Florist',
  description:
    'Do you have an amazing brand? Expose your product with Grass Florist online boutique. Submit your brand info, catalogue, and connect with our partnerships team.',
  path: '/partner-with-us',
  locale: 'en',
});

export default function EnglishPartnerWithUsPage() {
  return <PartnerWithUsPageView locale="en" />;
}
