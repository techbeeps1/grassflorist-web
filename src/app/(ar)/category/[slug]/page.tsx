import { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryPageView } from '@/views/CategoryPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreCategoryBySlug, getStoreCategories } from '@/lib/wordpress/store-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const [{ category, products }, categories] = await Promise.all([
    getStoreCategoryBySlug(slug, 'ar'),
    getStoreCategories('ar'),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">جاري تحميل القسم...</div>}>
      <CategoryPageView
        slug={slug}
        locale="ar"
        initialCategory={category}
        initialProducts={products}
        allCategories={categories.filter((c) => c.image && c.itemCount > 0)}
      />
    </Suspense>
  );
}
