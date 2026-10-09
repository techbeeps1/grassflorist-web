import { Metadata } from 'next';
import { BlogListingPageView } from '@/views/BlogListingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getBlogPosts } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'المجلة النباتية وأدلة العناية بالزهور | غراس فلوريست',
  description: 'مقالات وأدلة حصرية من كبار خبراء التنسيق النباتي في غراس فلوريست للعناية بالزهور وتنسيق هدايا المناسبات.',
  path: '/blog',
  locale: 'ar',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArabicBlogListingPage() {
  const posts = await getBlogPosts('ar');
  return <BlogListingPageView locale="ar" posts={posts} />;
}
