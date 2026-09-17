import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsPageView } from '@/views/ProductsPageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getStoreProducts } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  title: 'جميع باقات الورد والهدايا الفاخرة | متجر غراس فلوريست',
  description: 'تسوق تشكيلة متجر غراس فلوريست الكاملة من باقات الورد الطبيعي، الصناديق الفاخرة، النباتات، والشوكولاتة.',
  path: '/products',
  locale: 'ar',
});

export const revalidate = 120;

export default async function ProductsPage() {
  const { products } = await getStoreProducts({ per_page: 50, locale: 'ar' });

  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">جاري تحميل المنتجات...</div>}>
      <ProductsPageView locale="ar" initialProducts={products} />
    </Suspense>
  );
}
