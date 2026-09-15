import { Metadata } from 'next';
import { LoginPageView } from '@/views/LoginPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'تسجيل الدخول',
  description: 'سجل دخولك إلى حسابك في غراس للزهور والهدايا الفاخرة لمتابعة طلباتك والاستمتاع بمزايا حصرية.',
  path: '/login',
  locale: 'ar',
});

export default function ArabicLoginPage() {
  return <LoginPageView locale="ar" />;
}
