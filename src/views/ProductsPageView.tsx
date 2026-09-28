'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CategorySlider } from '@/components/home/CategorySlider';
import { CategoryFilters } from '@/components/category/CategoryFilters';
import { SortDropdown } from '@/components/category/SortDropdown';
import { MobileFilterDrawer } from '@/components/category/MobileFilterDrawer';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { ProductFilterState } from '@/types/product';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { SlidersHorizontal } from 'lucide-react';

import { Product } from '@/types/product';
import { Category } from '@/types/category';

interface ProductsPageViewProps {
  locale: Locale;
  initialProducts?: Product[];
  allCategories?: Category[];
}

function ProductsPageContent({ locale, initialProducts, allCategories }: ProductsPageViewProps) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();

  // Initial tag/category from URL query if provided
  const initialTag = searchParams?.get('tag') || undefined;
  const initialCategory = searchParams?.get('category') || undefined;

  const [filters, setFilters] = useState<ProductFilterState>({
    category: initialCategory,
    tags: initialTag ? [initialTag] : undefined,
    sortBy: 'popular',
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const baseProducts = initialProducts || [];

  const filteredProducts = useMemo(() => {
    let result = [...baseProducts];

    if (filters.category) {
      result = result.filter((p) => p.categorySlug === filters.category);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= (filters.minPrice || 0));
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      result = result.filter((p) => p.price <= (filters.maxPrice || Infinity));
    }

    if (filters.inStockOnly) {
      result = result.filter((p) => p.availability === 'in_stock');
    }

    if (filters.minRating) {
      result = result.filter((p) => p.rating >= (filters.minRating || 0));
    }

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((p) =>
        filters.tags?.some((t) => p.tags.includes(t))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
    }

    return result;
  }, [filters]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.nav.allProducts },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: dict.nav.allProducts,
      url: locale === 'ar' ? `${siteConfig.url}/products` : `${siteConfig.url}/en/products`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="py-6 bg-surface min-h-[80vh]">
        <div className="site-container">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          {/* Page Header */}
          <div className="mb-6 sm:mb-8 text-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              {dict.nav.allProducts}
            </h1>
            <p className="text-sm sm:text-base text-text-muted mt-1">
              {locale === 'ar'
                ? 'استكشف تشكيلة غراس الكاملة من باقات الزهور الطبيعية، التنسيقات الفاخرة، والهدايا الحصرية.'
                : 'Browse the complete Grass collection of fresh blossoms, luxury box arrangements, and gifts.'}
            </p>
          </div>

          {/* Category Switcher Carousel: Clean circles without header */}
          <div className="mb-6 bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3.5 border border-[#EFE7DC] shadow-2xs">
            <CategorySlider
              locale={locale}
              categories={allCategories}
              variant="compact"
              hideHeader={true}
              isContained={false}
              className="pt-0 bg-transparent"
            />
          </div>

          {/* Controls Bar (Total count, mobile filter trigger, sorting) */}
          <div className="bg-surface-subtle border border-border/80 rounded-2xl p-3 sm:p-3.5 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Mobile: Filter & Sort buttons row | Desktop: Left Filter & Count */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden font-bold text-xs h-10 w-full sm:w-auto rounded-xl justify-center"
                >
                  <SlidersHorizontal className="w-4 h-4 me-1.5 shrink-0" />
                  <span>{dict.category.filters}</span>
                </Button>

                <div className="sm:hidden w-full">
                  <SortDropdown
                    locale={locale}
                    value={filters.sortBy}
                    onChange={(sortVal) => setFilters({ ...filters, sortBy: sortVal })}
                    className="w-full"
                  />
                </div>

                <span className="hidden sm:inline-block text-xs font-semibold text-text-muted">
                  <span className="font-bold text-text-main">{filteredProducts.length}</span>{' '}
                  {dict.category.productCount}
                </span>
              </div>

              {/* Mobile Product Count */}
              <div className="flex sm:hidden items-center justify-between px-1 text-xs font-semibold text-text-muted">
                <span>
                  <span className="font-bold text-text-main">{filteredProducts.length}</span>{' '}
                  {dict.category.productCount}
                </span>
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="hidden sm:flex items-center justify-end">
                <SortDropdown
                  locale={locale}
                  value={filters.sortBy}
                  onChange={(sortVal) => setFilters({ ...filters, sortBy: sortVal })}
                />
              </div>
            </div>
          </div>

          {/* Layout Grid (Filters Sidebar + Products Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-3 p-5 bg-surface rounded-2xl border border-border/80 shadow-xs sticky top-36">
              <CategoryFilters
                locale={locale}
                filters={filters}
                onFilterChange={setFilters}
                categories={allCategories}
                onReset={() => setFilters({ sortBy: 'popular' })}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-9">
              <ProductGrid products={filteredProducts} locale={locale} />
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          locale={locale}
          filters={filters}
          onFilterChange={setFilters}
          categories={allCategories}
          onReset={() => setFilters({ sortBy: 'popular' })}
          productCount={filteredProducts.length}
        />
      </div>
    </>
  );
}

export function ProductsPageView(props: ProductsPageViewProps) {
  return (
    <Suspense fallback={<div className="py-6 bg-surface min-h-[80vh]" />}>
      <ProductsPageContent {...props} />
    </Suspense>
  );
}

