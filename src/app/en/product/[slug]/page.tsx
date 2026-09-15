import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductDetailPageView } from '@/views/ProductDetailPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreProductBySlug, getStoreProducts } from '@/lib/wordpress/store-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug, 'en');

  if (!product) {
    return generatePageMetadata({
      title: 'Product Not Found',
      path: `/product/${slug}`,
      locale: 'en',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: product.seoTitle.en,
    description: product.seoDescription.en,
    path: `/product/${slug}`,
    locale: 'en',
    image: product.thumbnail,
  });
}

export default async function EnglishProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug, 'en');

  let relatedProducts = undefined;
  if (product?.categorySlug) {
    const res = await getStoreProducts({
      category: product.categorySlug,
      per_page: 5,
      locale: 'en',
    });
    relatedProducts = res.products.filter((p) => p.id !== product.id).slice(0, 4);
  }

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Loading arrangement details...</div>}>
      <ProductDetailPageView
        slug={slug}
        locale="en"
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </Suspense>
  );
}
