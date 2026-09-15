import { Metadata } from 'next';
import { HomePageView } from '@/views/HomePageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getHomePageData } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  path: '/',
  locale: 'ar',
});

export const revalidate = 120;

export default async function HomePage() {
  const { categories, featuredProducts, bestsellers, newArrivals, categorySections } =
    await getHomePageData('ar');

  return (
    <HomePageView
      locale="ar"
      categories={categories}
      featuredProducts={featuredProducts}
      bestsellers={bestsellers}
      newArrivals={newArrivals}
      categorySections={categorySections}
    />
  );
}
