import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CategoryPageView } from '@/views/CategoryPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreCategoryBySlug, getHomeSliderCategories } from '@/lib/wordpress/store-api';
import { CategoryPageSkeleton } from '@/components/category/CategoryPageSkeleton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let { slug } = await params;
  if (slug.includes('%2F') || slug.includes('%2f') || slug.includes('/')) {
    const decoded = decodeURIComponent(slug);
    const parts = decoded.split('/').filter(Boolean);
    if (parts.length >= 1) {
      slug = parts[0];
    }
  }
  const { category } = await getStoreCategoryBySlug(slug, 'ar');

  if (!category) {
    return generatePageMetadata({
      title: 'القسم غير موجود',
      path: `/category/${slug}`,
      locale: 'ar',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: category.seoTitle.ar,
    description: category.seoDescription.ar,
    path: `/category/${slug}`,
    locale: 'ar',
    image: category.image,
  });
}

export default async function ArabicCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug.includes('%2F') || slug.includes('%2f') || slug.includes('/')) {
    const decoded = decodeURIComponent(slug);
    const parts = decoded.split('/').filter(Boolean);
    if (parts.length >= 2) {
      redirect(`/category/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`);
    }
  }
  const [{ category, products }, categories] = await Promise.all([
    getStoreCategoryBySlug(slug, 'ar'),
    getHomeSliderCategories('ar'),
  ]);

  return (
    <Suspense fallback={<CategoryPageSkeleton locale="ar" />}>
      <CategoryPageView
        slug={slug}
        locale="ar"
        initialCategory={category}
        initialProducts={products}
        allCategories={categories.filter((c) => Boolean(c.image))}
      />
    </Suspense>
  );
}
