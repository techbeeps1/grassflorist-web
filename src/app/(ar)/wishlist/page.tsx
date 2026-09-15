import { Metadata } from 'next';
import { WishlistPageView } from '@/views/WishlistPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'قائمة الرغبات والمفضلة',
  description: 'قائمة رغباتك وحفظ باقات الزهور والتنسيقات لمناسباتك القادمة.',
  path: '/wishlist',
  locale: 'ar',
  noIndex: true,
});

export default function ArabicWishlistPage() {
  return <WishlistPageView locale="ar" />;
}
