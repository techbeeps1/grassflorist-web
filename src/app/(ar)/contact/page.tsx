import { Metadata } from 'next';
import { ContactPageView } from '@/views/ContactPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getContactPageData } from '@/lib/wordpress/store-api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const contactData = await getContactPageData('ar');
  return generatePageMetadata({
    title:
      contactData?.seo?.meta_title ||
      'تواصل معنا | خدمة العملاء وفروع الرياض وجدة | غراس فلوريست',
    description:
      contactData?.seo?.meta_description ||
      'تواصل مع كونسيرج غراس فلوريست للطلبات الخاصة واستفسارات التوصيل السريع. هاتف، واتساب، وفروعنا.',
    path: '/contact',
    locale: 'ar',
  });
}

export default async function ArabicContactPage() {
  const contactData = await getContactPageData('ar');
  return <ContactPageView locale="ar" contactData={contactData} />;
}

