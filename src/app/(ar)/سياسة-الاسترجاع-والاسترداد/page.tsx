import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'ضمان النضارة وسياسة الاسترجاع | غراس فلوريست',
  description: 'ضمان غراس فلوريست الذهبي لنضارة الزهور لمدة 7 أيام وسياسة إعادة التنسيق أو استرجاع القيمة.',
  path: '/سياسة-الاسترجاع-والاسترداد',
  locale: 'ar',
});

export default function ArabicReturnsPolicyPage() {
  return <PolicyPageView type="returns" locale="ar" />;
}
