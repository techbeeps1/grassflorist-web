import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
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
  const { category } = await getStoreCategoryBySlug(slug, 'en');

  if (!category || (category as any).is_visible === false) {
    return generatePageMetadata({
      title: 'Category Not Found',
      path: `/category/${slug}`,
      locale: 'en',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: category.seoTitle.en,
    description: category.seoDescription.en,
    path: `/category/${slug}`,
    locale: 'en',
    image: category.image,
  });
}

export default async function EnglishCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug.includes('%2F') || slug.includes('%2f') || slug.includes('/')) {
    const decoded = decodeURIComponent(slug);
    const parts = decoded.split('/').filter(Boolean);
    if (parts.length >= 2) {
      redirect(`/en/category/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`);
    }
  }
  const [{ category, products, attributes }, categories] = await Promise.all([
    getStoreCategoryBySlug(slug, 'en'),
    getHomeSliderCategories('en'),
  ]);

  if (!category || (category as any).is_visible === false) {
    notFound();
  }

  return (
    <Suspense fallback={<CategoryPageSkeleton locale="en" />}>
      <CategoryPageView
        slug={slug}
        locale="en"
        initialCategory={category}
        initialProducts={products}
        allCategories={categories.filter((c) => Boolean(c.image))}
        initialAttributes={attributes}
      />
    </Suspense>
  );

}
