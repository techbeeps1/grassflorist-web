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
  const page = await getCmsPageBySlug(slug, 'ar');

  if (!page) {
    return generatePageMetadata({
      title: 'الصفحة غير موجودة | غراس فلوريست',
      description: 'الصفحة المطلوبة غير موجودة.',
      path: `/${slug}`,
      locale: 'ar',
    });
  }

  return generatePageMetadata({
    title: page?.seo?.meta_title || `${page.title} | غراس فلوريست`,
    description: page?.seo?.meta_description || page.short_description || `${page.title} - غراس فلوريست`,
    path: `/${slug}`,
    locale: 'ar',
  });
}

export default async function ArabicDynamicCmsPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug, 'ar');

  if (!page) {
    notFound();
  }

  return <PolicyPageView locale="ar" page={page} />;
}
