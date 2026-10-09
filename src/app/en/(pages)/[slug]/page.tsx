import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PolicyPageView } from '@/views/PolicyPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getCmsPageBySlug } from '@/lib/wordpress/store-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug, 'en');

  if (!page) {
    return generatePageMetadata({
      title: 'Page Not Found | Grass Florist',
      description: 'The requested page could not be found.',
      path: `/${slug}`,
      locale: 'en',
    });
  }

  return generatePageMetadata({
    title: page?.seo?.meta_title || `${page.title} | Grass Florist`,
    description: page?.seo?.meta_description || page.short_description || `${page.title} - Grass Florist`,
    path: `/${slug}`,
    locale: 'en',
  });
}

export default async function EnglishDynamicCmsPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug, 'en');

  if (!page) {
    notFound();
  }

  return <PolicyPageView locale="en" page={page} />;
}
