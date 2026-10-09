import { Metadata } from 'next';
import { PartnerWithUsPageView } from '@/views/PartnerWithUsPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'شارك معنا | شراكات العلامات التجارية والموردين | غراس فلوريست',
  description:
    'هل لديك علامة تجارية مميزة؟ شارك منتجاتك مع بوتيك غراس فلوريست الإلكتروني وتواصل معنا الآن لعرض منتجاتك والوصول لآلاف العملاء.',
  path: '/partner-with-us',
  locale: 'ar',
});

export default function ArabicPartnerWithUsPage() {
  return <PartnerWithUsPageView locale="ar" />;
}
