import { SubscriptionFrequencyConfigView } from '@/views/SubscriptionFrequencyConfigView';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generatePageMetadata({
    title: `Subscription Frequency & Duration - ${slug}`,
    description: 'Choose your recurring delivery frequency, duration, and starting date.',
    path: `/en/flowers-subscription-deals/${slug}/frequency`,
    locale: 'en',
  });
}

export default async function EnglishSubscriptionFrequencyPage({ params }: PageProps) {
  const { slug } = await params;
  return <SubscriptionFrequencyConfigView slug={slug} locale="en" />;
}
