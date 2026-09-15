import { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryPageView } from '@/views/CategoryPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreCategoryBySlug } from '@/lib/wordpress/store-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 120;

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
  const { category, products } = await getStoreCategoryBySlug(slug, 'en');

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Loading category collection...</div>}>
      <CategoryPageView
        slug={slug}
        locale="en"
        initialCategory={category}
        initialProducts={products}
      />
    </Suspense>
  );
}
