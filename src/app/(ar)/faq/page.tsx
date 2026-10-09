import { Metadata } from 'next';
import { FaqPageView } from '@/views/FaqPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getFaqs } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'الأسئلة الشائعة | التوصيل، العناية بالزهور، والضمان',
  description: 'إجابات شاملة عن التوصيل في نفس اليوم، كيفية العناية بالزهور لتطول مدتها، وطرق الدفع والضمان.',
  path: '/faq',
  locale: 'ar',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArabicFaqPage() {
  const faqs = await getFaqs('ar');
  return <FaqPageView locale="ar" faqs={faqs} />;
}
