import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'سياسة التوصيل المبرد والشحن السريع',
  description: 'تفاصيل أسطول التوصيل المبرد بدرجة 16-18 مئوية والتوصيل في نفس اليوم خلال 3 ساعات في الرياض وجدة والشرقية.',
  path: '/policies/shipping',
  locale: 'ar',
});

export default function ArabicShippingPolicyPage() {
  return <PolicyPageView type="shipping" locale="ar" />;
}
