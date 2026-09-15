import { Metadata } from 'next';
import { RegisterPageView } from '@/views/RegisterPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'إنشاء حساب جديد',
  description: 'انضم إلى بوتيك غراس للزهور والهدايا الفاخرة للاستمتاع بتجربة إهداء مميزة وتتبع طلباتك بسهولة.',
  path: '/register',
  locale: 'ar',
});

export default function ArabicRegisterPage() {
  return <RegisterPageView locale="ar" />;
}
