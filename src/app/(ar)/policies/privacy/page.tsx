import { Metadata } from 'next';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'سياسة الخصوصية وأمان البيانات | غراس فلوريست',
  description: 'تعرف على التزام غراس فلوريست بحماية بيانات العملاء وخصوصية بطاقات الإهداء وسرية المستلم.',
  path: '/policies/privacy',
  locale: 'ar',
});

export default function ArabicPrivacyPolicyPage() {
  return <PolicyPageView type="privacy" locale="ar" />;
}
