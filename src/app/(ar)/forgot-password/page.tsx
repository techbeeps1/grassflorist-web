import { Metadata } from 'next';
import { ForgotPasswordPageView } from '@/views/ForgotPasswordPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'استعادة كلمة المرور',
  description: 'استعد كلمة المرور الخاصة بحسابك في غراس للزهور والهدايا.',
  path: '/forgot-password',
  locale: 'ar',
});

export default function ArabicForgotPasswordPage() {
  return <ForgotPasswordPageView locale="ar" />;
}
