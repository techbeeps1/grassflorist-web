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
import { products } from '@/data/products';
import { faqs } from '@/data/faqs';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFaqSchema,
} from '@/lib/schema';
import { ArrowRight, ArrowLeft } from 'lucide-react';

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

  const featuredProducts =
    initialFeatured && initialFeatured.length > 0
      ? initialFeatured
      : products.filter((p) => p.featured).slice(0, 4);

  const bestsellers =
    initialBestsellers && initialBestsellers.length > 0
      ? initialBestsellers
      : products.filter((p) => p.bestseller).slice(0, 8);

  const newArrivals =
    initialNewArrivals && initialNewArrivals.length > 0
      ? initialNewArrivals
      : products.filter((p) => p.newArrival).slice(0, 8);

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
                    className="group hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white hover:bg-[#FAF3ED] text-[#201B18] border border-[#D5C6B5] shadow-2xs hover:shadow-xs text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0"
                  >
                    <span>{dict.common.viewAll}</span>
                    <span className="w-5 h-5 rounded-full bg-[#FAF3ED] group-hover:bg-[#435849] group-hover:text-white flex items-center justify-center transition-colors duration-200 shrink-0">
                      <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-200" />
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
        <section aria-label="Frequently Asked Questions" className="py-14 sm:py-20 bg-white">
          <div className="site-container">
            <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
                {dict.home.faqTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5049] mt-2">
                {dict.home.faqSubtitle}
              </p>
            </div>

            <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 shadow-sm">
              <Accordion
                items={homeFaqs.map((faq) => ({
                  id: faq.id,
                  title: faq.question[locale],
                  content: faq.answer[locale],
                }))}
              />
            </div>

            <div className="mt-8 text-center">
              <Link
                href={faqUrl}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white hover:bg-[#FAF3ED] text-[#201B18] border border-[#D5C6B5] shadow-2xs hover:shadow-xs text-xs font-bold whitespace-nowrap transition-all duration-200"
              >
                <span>{locale === 'ar' ? 'عرض جميع الأسئلة الشائعة' : 'View All FAQs'}</span>
                <span className="w-5 h-5 rounded-full bg-[#FAF3ED] group-hover:bg-[#435849] group-hover:text-white flex items-center justify-center transition-colors duration-200 shrink-0">
                  <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-200" />
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
