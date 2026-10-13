import { SubscriptionProductDetailView } from '@/views/SubscriptionProductDetailView';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generatePageMetadata({
    title: `تفاصيل باقة الاشتراك - ${slug}`,
    description: 'اختر باقة اشتراك الزهور الطبيعية مع جدول تكرار وتوصيل مجاني.',
    path: `/flowers-subscription-deals/${slug}`,
    locale: 'ar',
  });
}

export default async function ArabicSubscriptionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <SubscriptionProductDetailView slug={slug} locale="ar" />;
}
