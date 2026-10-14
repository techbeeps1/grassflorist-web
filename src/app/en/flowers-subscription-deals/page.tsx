import { FlowersSubscriptionDealsView } from '@/views/FlowersSubscriptionDealsView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata({
    title: 'Fresh Flower Subscription Deals',
    description: 'Subscribe to Grass Florist recurring bouquets and save up to 20% with scheduled refrigerated delivery and a complimentary luxury vase.',
    path: '/en/flowers-subscription-deals',
    locale: 'en',
  });
}

export default function EnglishFlowersSubscriptionDealsPage() {
  return <FlowersSubscriptionDealsView locale="en" />;
}
