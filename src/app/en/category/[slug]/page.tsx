import { Metadata } from 'next';
import { Suspense } from 'react';
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
  const { slug } = await params;
  const { category } = await getStoreCategoryBySlug(slug, 'en');

  if (!category) {
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
  const [{ category, products }, categories] = await Promise.all([
    getStoreCategoryBySlug(slug, 'en'),
    getHomeSliderCategories('en'),
  ]);

  return (
    <Suspense fallback={<CategoryPageSkeleton locale="en" />}>
      <CategoryPageView
        slug={slug}
        locale="en"
        initialCategory={category}
        initialProducts={products}
        allCategories={categories.filter((c) => Boolean(c.image))}
      />
    </Suspense>
  );
}
