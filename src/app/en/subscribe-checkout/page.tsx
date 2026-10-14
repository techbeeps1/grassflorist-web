import { Suspense } from 'react';
import { SubscribeCheckoutPageView } from '@/views/SubscribeCheckoutPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata({
    title: 'Subscribe Checkout',
    description: 'Complete your direct recurring flower subscription with secure payment and scheduled refrigerated delivery inside Jeddah.',
    path: '/en/subscribe-checkout',
    locale: 'en',
  });
}

export default function EnglishSubscribeCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#2D3F33] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SubscribeCheckoutPageView locale="en" />
    </Suspense>
  );
}
