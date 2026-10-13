import { Metadata } from 'next';
import { AboutPageView } from '@/views/AboutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'عن غراس فلوريست | متجر زهور إلكتروني سعودي في جدة',
  description: 'في غراس فلوريست نصنع تجارب تنبض بالمشاعر. متجر زهور إلكتروني سعودي متخصص في بيع وتوصيل باقات الورد والزهور في جدة.',
  path: '/about',
  locale: 'ar',
});

export default function ArabicAboutPage() {
  return <AboutPageView locale="ar" />;
}
