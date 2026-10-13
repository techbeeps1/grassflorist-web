import { SubscriptionFrequencyConfigView } from '@/views/SubscriptionFrequencyConfigView';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generatePageMetadata({
    title: `جدول تكرار الاشتراك - ${slug}`,
    description: 'حدد تكرار التوصيل ومدة الاشتراك وتاريخ أول باقة مع توصيل مجاني.',
    path: `/flowers-subscription-deals/${slug}/frequency`,
    locale: 'ar',
  });
}

export default async function ArabicSubscriptionFrequencyPage({ params }: PageProps) {
  const { slug } = await params;
  return <SubscriptionFrequencyConfigView slug={slug} locale="ar" />;
}
