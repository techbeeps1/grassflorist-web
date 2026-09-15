import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'الشروط والأحكام',
  description: 'الشروط والأحكام العامة لمتجر فلوريل لطلب وتوصيل باقات الزهور والهدايا الفاخرة.',
  path: '/policies/terms',
  locale: 'ar',
});

export default function ArabicTermsPolicyPage() {
  return <PolicyPageView type="terms" locale="ar" />;
}
