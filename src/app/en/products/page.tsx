import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsPageView } from '@/views/ProductsPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreProducts } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'All Luxury Flowers & Curated Gifts | Grass Florist Catalog',
  description: 'Explore the full Grass Florist assortment of handcrafted flower bouquets, hatboxes, plants, and chocolates.',
  path: '/products',
  locale: 'en',
});

export const revalidate = 120;

export default async function EnglishProductsPage() {
  const { products } = await getStoreProducts({ per_page: 50, locale: 'en' });

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Loading floral catalog...</div>}>
      <ProductsPageView locale="en" initialProducts={products} />
    </Suspense>
  );
}
