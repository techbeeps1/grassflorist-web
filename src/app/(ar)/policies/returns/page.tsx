import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'سياسة الاستبدال وضمان النضارة 100%',
  description: 'ضمان فلوريل الذهبي لنضارة الزهور لمدة 7 أيام وسياسة إعادة التنسيق أو استرجاع القيمة.',
  path: '/policies/returns',
  locale: 'ar',
});

export default function ArabicReturnsPolicyPage() {
  return <PolicyPageView type="returns" locale="ar" />;
}
