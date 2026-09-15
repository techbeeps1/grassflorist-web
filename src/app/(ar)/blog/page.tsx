import { Metadata } from 'next';
import { BlogListingPageView } from '@/views/BlogListingPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'مدونة الزهور والفنون النباتية',
  description: 'مقالات وأدلة حصرية من كبار خبراء التنسيق النباتي في فلوريل للعناية بالزهور وتنسيق هدايا المناسبات.',
  path: '/blog',
  locale: 'ar',
});

export default function ArabicBlogListingPage() {
  return <BlogListingPageView locale="ar" />;
}
