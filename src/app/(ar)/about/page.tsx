import { Metadata } from 'next';
import { AboutPageView } from '@/views/AboutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'عن غراس فلوريست | بوتيك الزهور الفاخرة وسلسلة التبريد',
  description: 'تعرف على قصة بوتيك غراس فلوريست، التزامنا باستيراد أجود الزهور الهولندية وسلسلة التبريد المتكاملة.',
  path: '/about',
  locale: 'ar',
});

export default function ArabicAboutPage() {
  return <AboutPageView locale="ar" />;
}
