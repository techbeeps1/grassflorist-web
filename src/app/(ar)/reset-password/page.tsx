import { Metadata } from 'next';
import { ResetPasswordPageView } from '@/views/ResetPasswordPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'تعيين كلمة المرور',
  description: 'قم بتعيين كلمة مرور جديدة لحسابك في غراس للزهور.',
  path: '/reset-password',
  locale: 'ar',
});

export default function ArabicResetPasswordPage() {
  return <ResetPasswordPageView locale="ar" />;
}
