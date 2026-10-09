import { Metadata } from 'next';
import { BlogListingPageView } from '@/views/BlogListingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getBlogPosts } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'Botanical Journal & Floral Guides | Grass Florist',
  description: 'Exclusive guides and articles from master floral designers at Grass Florist on floral longevity, arranging, and luxury gifting.',
  path: '/blog',
  locale: 'en',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EnglishBlogListingPage() {
  const posts = await getBlogPosts('en');
  return <BlogListingPageView locale="en" posts={posts} />;
}
