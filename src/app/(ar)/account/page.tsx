import { Metadata } from 'next';
import { AccountPageView } from '@/views/AccountPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'حسابي',
  description: 'إدارة حسابك الشخصي، تفاصيل الملف والطلبات السابقة في غراس.',
  path: '/account',
  locale: 'ar',
  noIndex: true,
});

export default function ArabicAccountPage() {
  return <AccountPageView locale="ar" />;
}
