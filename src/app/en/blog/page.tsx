import { Metadata } from 'next';
import { BlogListingPageView } from '@/views/BlogListingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Botanical Journal & Floral Guides | Grass Florist',
  description: 'Exclusive guides and articles from master floral designers at Grass Florist on floral longevity, arranging, and luxury gifting.',
  path: '/blog',
  locale: 'en',
});

export default function EnglishBlogListingPage() {
  return <BlogListingPageView locale="en" />;
}
