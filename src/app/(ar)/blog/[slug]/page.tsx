import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostPageView } from '@/views/BlogPostPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/wordpress/store-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getBlogPostBySlug(decodedSlug, 'ar');

  if (!post) {
    return generatePageMetadata({
      title: 'المقال غير موجود',
      path: `/blog/${slug}`,
      locale: 'ar',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: post.seoTitle.ar || post.title.ar,
    description: post.seoDescription.ar || post.excerpt.ar,
    path: `/blog/${slug}`,
    locale: 'ar',
    image: post.coverImage,
  });
}

export default async function ArabicBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(decodedSlug, 'ar'),
    getBlogPosts('ar'),
  ]);

  if (!post) {
    notFound();
  }

  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return <BlogPostPageView slug={decodedSlug} locale="ar" post={post} relatedPosts={related} />;
}
