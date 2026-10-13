import { Metadata } from 'next';
import { ContactPageView } from '@/views/ContactPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getContactPageData } from '@/lib/wordpress/store-api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const contactData = await getContactPageData('en');
  return generatePageMetadata({
    title: contactData?.seo?.meta_title || 'Contact Concierge | Grass Florist Ateliers Riyadh & Jeddah',
    description:
      contactData?.seo?.meta_description ||
      'Connect with the Grass Florist floral concierge for bespoke requests and delivery inquiries. Phone, WhatsApp, and boutiques.',
    path: '/contact',
    locale: 'en',
  });
}

export default async function EnglishContactPage() {
  const contactData = await getContactPageData('en');
  if (contactData) {
    if (contactData.working_hours) {
      contactData.working_hours = contactData.working_hours.replace(/11:30/g, '11:00');
    }
    if (contactData.title) {
      contactData.title = contactData.title.replace(/فلوريل/g, 'غراس').replace('Connect with Our Concierge', 'Contact the Grass Florist Team');
    }
  }
  return <ContactPageView locale="en" contactData={contactData} />;
}

