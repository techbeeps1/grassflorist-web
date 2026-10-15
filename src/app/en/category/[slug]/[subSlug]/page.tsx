import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CategoryPageView } from '@/views/CategoryPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreCategoryBySlug, getHomeSliderCategories } from '@/lib/wordpress/store-api';
import { CategoryPageSkeleton } from '@/components/category/CategoryPageSkeleton';

interface PageProps {
  params: Promise<{ slug: string; subSlug: string }>;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const { category } = await getStoreCategoryBySlug(slug, 'en');

  if (!category || (category as any).is_visible === false) {
    return generatePageMetadata({
      title: 'Category Not Found',
      path: `/category/${slug}/${subSlug}`,
      locale: 'en',
      noIndex: true,
    });
  }

  const subCategory = category.subcategories?.find(
    (s) => s.slug.toLowerCase() === subSlug.toLowerCase() || decodeURIComponent(s.slug).toLowerCase() === decodeURIComponent(subSlug).toLowerCase()
  );

  const title = subCategory
    ? `${subCategory.name.en || subCategory.name.ar} - ${category.seoTitle.en}`
    : category.seoTitle.en;

  return generatePageMetadata({
    title,
    description: category.seoDescription.en,
    path: `/category/${slug}/${subSlug}`,
    locale: 'en',
    image: subCategory?.image || category.image,
  });
}

export default async function EnglishSubcategoryPage({ params }: PageProps) {
  const { slug, subSlug } = await params;
  const [{ category, products }, categories] = await Promise.all([
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
        initialSubcategory={subSlug}
      />
    </Suspense>
  );
}
