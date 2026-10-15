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
  const { category } = await getStoreCategoryBySlug(slug, 'ar');

  if (!category || (category as any).is_visible === false) {
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
  const [{ category, products, attributes }, categories] = await Promise.all([
    getStoreCategoryBySlug(slug, 'ar'),
    getHomeSliderCategories('ar'),
  ]);

  if (!category || (category as any).is_visible === false) {
    notFound();
  }

  // Conflict resolution: verify subSlug belongs to this category
  const decodedSubSlug = decodeURIComponent(subSlug).toLowerCase().trim();
  const isDirectSub = category.subcategories?.some((s) => {
    const sSlug = decodeURIComponent(s.slug).toLowerCase().trim();
    return sSlug === decodedSubSlug || s.slug.toLowerCase().trim() === decodedSubSlug;
  });

  if (!isDirectSub) {
    // If slug is a child category that has a parent (e.g. latex-balloons's parent is balloons),
    // and subSlug is actually a sibling or valid category under that parent,
    // redirect to canonical URL: /category/[parentSlug]/[subSlug]
    if (category.parent?.slug) {
      const parentSlug = category.parent.slug_ar || category.parent.slug;
      const { redirect } = await import('next/navigation');
      redirect(`/category/${parentSlug}/${subSlug}`);
    }
    notFound();
  }

  return (
    <Suspense fallback={<CategoryPageSkeleton locale="ar" />}>
      <CategoryPageView
        slug={slug}
        locale="ar"
        initialCategory={category}
        initialProducts={products}
        allCategories={categories.filter((c) => Boolean(c.image))}
        initialSubcategory={subSlug}
        initialAttributes={attributes}
      />
    </Suspense>
  );

}
