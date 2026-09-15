import { Metadata } from 'next';
import { ContactPageView } from '@/views/ContactPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'تواصل معنا | خدمة العملاء وفروع الرياض وجدة',
  description: 'تواصل مع كونسيرج فلوريل للطلبات الخاصة واستفسارات التوصيل السريع. هاتف، واتساب، وفروعنا.',
  path: '/contact',
  locale: 'ar',
});

export default function ArabicContactPage() {
  return <ContactPageView locale="ar" />;
}
