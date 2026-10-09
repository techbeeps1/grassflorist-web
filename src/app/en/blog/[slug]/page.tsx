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
  const post = await getBlogPostBySlug(decodedSlug, 'en');

  if (!post) {
    return generatePageMetadata({
      title: 'Article Not Found',
      path: `/blog/${slug}`,
      locale: 'en',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: post.seoTitle.en || post.title.en,
    description: post.seoDescription.en || post.excerpt.en,
    path: `/blog/${slug}`,
    locale: 'en',
    image: post.coverImage,
  });
}

export default async function EnglishBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(decodedSlug, 'en'),
    getBlogPosts('en'),
  ]);

  if (!post) {
    notFound();
  }

  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return <BlogPostPageView slug={decodedSlug} locale="en" post={post} relatedPosts={related} />;
}
