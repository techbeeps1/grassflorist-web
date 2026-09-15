import { Metadata } from 'next';
import { WishlistPageView } from '@/views/WishlistPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'My Wishlist',
  description: 'Saved floral bouquets and gifts for your upcoming celebrations.',
  path: '/wishlist',
  locale: 'en',
  noIndex: true,
});

export default function EnglishWishlistPage() {
  return <WishlistPageView locale="en" />;
}
