import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductDetailPageView } from '@/views/ProductDetailPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreProductBySlug, getStoreProducts, getStoreProductDetails } from '@/lib/wordpress/store-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug, 'ar');

  if (!product) {
    return generatePageMetadata({
      title: 'المنتج غير موجود',
      path: `/product/${slug}`,
      locale: 'ar',
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: product.seoTitle.ar,
    description: product.seoDescription.ar,
    path: `/product/${slug}`,
    locale: 'ar',
    image: product.thumbnail,
  });
}

export default async function ArabicProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { product, relatedProducts: apiRelated } = await getStoreProductDetails(decodedSlug, 'ar');

  let relatedProducts = apiRelated && apiRelated.length > 0 ? apiRelated : undefined;
  if (!relatedProducts && product?.categorySlug) {
    try {
      const res = await getStoreProducts({
        category: product.categorySlug,
        per_page: 5,
        locale: 'ar',
      });
      relatedProducts = res.products.filter((p) => p.id !== product.id).slice(0, 4);
    } catch {
      // ignore related products fetch failure
    }
  }

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">جاري تحميل تفاصيل الباقة...</div>}>
      <ProductDetailPageView
        slug={decodedSlug}
        locale="ar"
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </Suspense>
  );
}
