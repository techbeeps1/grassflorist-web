import { SubscriptionProductDetailView } from '@/views/SubscriptionProductDetailView';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generatePageMetadata({
    title: `Subscription Plan - ${slug}`,
    description: 'Fresh recurring flower bouquets with free scheduled delivery.',
    path: `/en/flowers-subscription-deals/${slug}`,
    locale: 'en',
  });
}

export default async function EnglishSubscriptionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <SubscriptionProductDetailView slug={slug} locale="en" />;
}
