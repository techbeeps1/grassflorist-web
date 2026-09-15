import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostPageView } from '@/views/BlogPostPageView';
import { blogPosts } from '@/data/blog';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug.en,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug.ar === slug || p.slug.en === slug);

  if (!post) {
    return generatePageMetadata({
      title: 'Article Not Found',
      path: `/blog/${slug}`,
      locale: 'en',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: post.seoTitle.en,
    description: post.seoDescription.en,
    path: `/blog/${slug}`,
    locale: 'en',
    image: post.coverImage,
  });
}

export default async function EnglishBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug.ar === slug || p.slug.en === slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPageView slug={slug} locale="en" />;
}
