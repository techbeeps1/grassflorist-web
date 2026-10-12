import { Metadata } from 'next';
import { Suspense } from 'react';
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
  const { category } = await getStoreCategoryBySlug(slug, 'ar');

  if (!category) {
    return generatePageMetadata({
      title: 'القسم غير موجود',
      path: `/category/${slug}/${subSlug}`,
      locale: 'ar',
      noIndex: true,
    });
  }

  const subCategory = category.subcategories?.find(
    (s) => s.slug.toLowerCase() === subSlug.toLowerCase() || decodeURIComponent(s.slug).toLowerCase() === decodeURIComponent(subSlug).toLowerCase()
  );

  const title = subCategory
    ? `${subCategory.name.ar || subCategory.name.en} - ${category.seoTitle.ar}`
    : category.seoTitle.ar;

  return generatePageMetadata({
    title,
    description: category.seoDescription.ar,
    path: `/category/${slug}/${subSlug}`,
    locale: 'ar',
    image: subCategory?.image || category.image,
  });
}

export default async function ArabicSubcategoryPage({ params }: PageProps) {
  const { slug, subSlug } = await params;
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
        initialSubcategory={subSlug}
      />
    </Suspense>
  );
}
