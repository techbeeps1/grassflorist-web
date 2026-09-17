import { Metadata } from 'next';
import { ContactPageView } from '@/views/ContactPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact Concierge | Grass Florist Ateliers Riyadh & Jeddah',
  description: 'Connect with the Grass Florist floral concierge for bespoke requests and delivery inquiries. Phone, WhatsApp, and boutiques.',
  path: '/contact',
  locale: 'en',
});

export default function EnglishContactPage() {
  return <ContactPageView locale="en" />;
}
