import React from 'react';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { HeroBannerSlider } from '@/components/home/HeroBannerSlider';
import { CategorySlider } from '@/components/home/CategorySlider';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { EditorialStoryBanner } from '@/components/home/EditorialStoryBanner';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { faqs } from '@/data/faqs';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFaqSchema,
} from '@/lib/schema';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { HomeCategorySection } from '@/lib/wordpress/store-api';

interface HomePageViewProps {
  locale: Locale;
  categories?: Category[];
  featuredProducts?: Product[];
  bestsellers?: Product[];
  newArrivals?: Product[];
  categorySections?: HomeCategorySection[];
}

export function HomePageView({
  locale,
  categories: initialCategories,
  featuredProducts: initialFeatured,
  bestsellers: initialBestsellers,
  newArrivals: initialNewArrivals,
  categorySections,
}: HomePageViewProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const featuredProducts = initialFeatured || [];
  const bestsellers = initialBestsellers || [];
  const newArrivals = initialNewArrivals || [];

  const homeFaqs = faqs.slice(0, 6);

  // Structured Data
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema(locale);
  const faqSchema = generateFaqSchema(homeFaqs, locale);

  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';
  const faqUrl = locale === 'ar' ? '/faq' : '/en/faq';

  return (
    <>
      {/* Localized JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="w-full">
        {/* 1. Full-Width Hero Banner Slider & Trust Perks Ribbon (Theme: White) */}
        <HeroBannerSlider locale={locale} />

        {/* 2. Horizontal Category Discovery Slider (Theme: White) */}
        <CategorySlider locale={locale} categories={initialCategories} />

        {/* 3. Category-Wise Product Carousel Sections (Matching Live Store API) */}
        {categorySections && categorySections.length > 0 ? (
          <>
            {categorySections.map((section, idx) => (
              <React.Fragment key={section.id}>
                <section
                  aria-label={`${section.title[locale]} Carousel`}
                  className="py-12 sm:py-16 bg-white"
                >
                  <div className="site-container">
                    <ProductCarousel
                      products={section.products}
                      locale={locale}
                      title={section.title[locale]}
                      subtitle={section.subtitle[locale]}
                      viewAllUrl={
                        locale === 'ar'
                          ? `/category/${section.categorySlug}`
                          : `/en/category/${section.categorySlug}`
                      }
                      viewAllLabel={dict.common.viewAll}
                    />
                  </div>
                </section>
                {/* Lifestyle editorial banner placed between flower arrangements and sweets/balloons */}
                {idx === 1 && <EditorialStoryBanner locale={locale} />}
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {/* Fallback to Featured & Bestsellers if categorySections not loaded */}
            <section aria-label="Featured Collection" className="py-14 sm:py-20 bg-[#EFE7DC]">
              <div className="site-container">
                <div className="flex items-end justify-between mb-8 sm:mb-10">
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
                      {dict.home.featuredTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A5049] mt-1">
                      {dict.home.featuredSubtitle}
                    </p>
                  </div>

                  <Link
                    href={catalogUrl}
                    className="group hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#FAF5EE] hover:bg-[#2D3F33] text-[#1E1915] hover:text-white border border-[#DDD3C6] hover:border-[#2D3F33] shadow-xs hover:shadow-md text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 hover:scale-[1.02] active:scale-95 shrink-0"
                  >
                    <span>{dict.common.viewAll}</span>
                    <span className="w-6 h-6 rounded-full bg-[#2D3F33] group-hover:bg-white text-white group-hover:text-[#2D3F33] flex items-center justify-center transition-colors shrink-0 ms-1">
                      <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </div>

                <ProductGrid products={featuredProducts} locale={locale} />
              </div>
            </section>

            <section aria-label="Best Sellers Carousel" className="py-14 sm:py-20 bg-white">
              <div className="site-container">
                <ProductCarousel
                  products={bestsellers}
                  locale={locale}
                  badge={locale === 'ar' ? 'خيارات النخبة' : 'CLIENT FAVORITES'}
                  title={dict.home.bestSellersTitle}
                  subtitle={dict.home.bestSellersSubtitle}
                  viewAllUrl={catalogUrl}
                  viewAllLabel={dict.common.viewAll}
                />
              </div>
            </section>

            <EditorialStoryBanner locale={locale} />

            <section aria-label="New Arrivals Carousel" className="py-14 sm:py-20 bg-white">
              <div className="site-container">
                <ProductCarousel
                  products={newArrivals}
                  locale={locale}
                  badge={locale === 'ar' ? 'إبداعات الموسم' : 'NEW SEASONAL CREATIONS'}
                  title={dict.home.newArrivalsTitle}
                  subtitle={dict.home.newArrivalsSubtitle}
                  viewAllUrl={catalogUrl}
                  viewAllLabel={dict.common.viewAll}
                />
              </div>
            </section>
          </>
        )}

        {/* 9. Brand Trust & Benefits (Theme: Pastel Sand) */}
        <BenefitsSection locale={locale} />

        {/* 10. Verified Client Testimonials (Theme: White) */}
        <TestimonialsSection locale={locale} />

        {/* 11. Atelier Journal & Floral Inspiration (Theme: Pastel Sand) */}
        <BlogPreviewSection locale={locale} />

        {/* 12. FAQ Accordion Section on Homepage (Theme: White) */}
        <section aria-label="Frequently Asked Questions" className="py-16 sm:py-24 bg-white">
          <div className="site-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10 sm:mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#435849] border border-[#EAE3D7] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#8CA841]" />
                  <span>{locale === 'ar' ? 'مركز المساعدة والإرشادات' : 'HELP & FLORAL GUIDANCE'}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E1915] leading-tight">
                  {dict.home.faqTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5E52] mt-2.5 max-w-xl mx-auto leading-relaxed">
                  {dict.home.faqSubtitle}
                </p>
              </div>

              <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-7 md:p-9 border border-[#EFE7DC] shadow-sm">
                <Accordion
                  variant="card"
                  items={homeFaqs.map((faq) => ({
                    id: faq.id,
                    title: faq.question[locale],
                    content: faq.answer[locale],
                  }))}
                />
              </div>

              <div className="mt-8 sm:mt-10 text-center">
                <Link
                  href={faqUrl}
                  className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#FAF5EE] hover:bg-[#2D3F33] text-[#1E1915] hover:text-white border border-[#DDD3C6] hover:border-[#2D3F33] shadow-xs hover:shadow-md text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <span>{locale === 'ar' ? 'عرض جميع الأسئلة الشائعة' : 'View All FAQs'}</span>
                  <span className="w-6 h-6 rounded-full bg-[#2D3F33] group-hover:bg-white text-white group-hover:text-[#2D3F33] flex items-center justify-center transition-colors shrink-0 ms-1">
                    <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
