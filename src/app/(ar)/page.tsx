import { Metadata } from 'next';
import { HomePageView } from '@/views/HomePageView';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getHomePageData } from '@/lib/wordpress/store-api';

export const metadata: Metadata = generatePageMetadata({
  path: '/',
  locale: 'ar',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const {
    heroSlides,
    categories,
    popularSection,
    editorialBanner,
    benefitsSection,
    eventsSection,
    featuredProducts,
    bestsellers,
    newArrivals,
    categorySections,
    blogSection,
    testimonialsSection,
    faqSection,
  } = await getHomePageData('ar');

  return (
    <HomePageView
      locale="ar"
      heroSlides={heroSlides}
      categories={categories}
      popularSection={popularSection}
      editorialBanner={editorialBanner}
      benefitsSection={benefitsSection}
      eventsSection={eventsSection}
      featuredProducts={featuredProducts}
      bestsellers={bestsellers}
      newArrivals={newArrivals}
      categorySections={categorySections}
      blogSection={blogSection}
      testimonialsSection={testimonialsSection}
      faqSection={faqSection}
    />
  );
}
