import { FlowersSubscriptionDealsView } from '@/views/FlowersSubscriptionDealsView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata({
    title: 'عروض وباقات اشتراكات الزهور الدورية',
    description: 'اشترك في باقات زهور غراس الدورية ووفر حتى 30% مع توصيل مجاني ومزهرية فاخرة مجانية مع أول توصيلة.',
    path: '/flowers-subscription-deals',
    locale: 'ar',
  });
}

export default function FlowersSubscriptionDealsPage() {
  return <FlowersSubscriptionDealsView locale="ar" />;
}
