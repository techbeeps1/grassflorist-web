import { Metadata } from 'next';
import { FaqPageView } from '@/views/FaqPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'الأسئلة الشائعة | التوصيل، العناية بالزهور، والضمان',
  description: 'إجابات شاملة عن التوصيل في نفس اليوم، كيفية العناية بالزهور لتطول مدتها، وطرق الدفع والضمان.',
  path: '/faq',
  locale: 'ar',
});

export default function ArabicFaqPage() {
  return <FaqPageView locale="ar" />;
}
