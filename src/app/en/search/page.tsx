import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageView } from '@/views/SearchPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Search Flowers & Luxury Gifts',
  description: 'Search across curated fresh flowers, Belgian chocolates, and living plants on Florelle.',
  path: '/search',
  locale: 'en',
  noIndex: true,
});

export default function EnglishSearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Searching floral boutique...</div>}>
      <SearchPageView locale="en" />
    </Suspense>
  );
}
