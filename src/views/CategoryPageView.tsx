'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useSearchParams } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CategoryFilters } from '@/components/category/CategoryFilters';
import { SortDropdown } from '@/components/category/SortDropdown';
import { MobileFilterDrawer } from '@/components/category/MobileFilterDrawer';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { categories } from '@/data/categories';
import { ProductFilterState } from '@/types/product';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { SlidersHorizontal } from 'lucide-react';

import { Product } from '@/types/product';
import { Category } from '@/types/category';

interface CategoryPageViewProps {
  slug: string;
  locale: Locale;
  initialCategory?: Category | null;
  initialProducts?: Product[];
}

function CategoryPageContent({
  slug,
  locale,
  initialCategory,
  initialProducts,
}: CategoryPageViewProps) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();

  const decodedSlug = decodeURIComponent(slug).trim();
  const currentCategory =
    initialCategory ||
    categories.find(
      (c) =>
        c.slug === slug ||
        decodeURIComponent(c.slug) === decodedSlug ||
        c.name.ar === decodedSlug ||
        c.name.en.toLowerCase() === decodedSlug.toLowerCase()
    );

  if (!currentCategory) {
    notFound();
  }

  const subcategoryParam = searchParams?.get('subcategory') || undefined;

  const [filters, setFilters] = useState<ProductFilterState>({
    category: slug,
    sortBy: 'popular',
  });

  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(
    subcategoryParam
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const baseProducts = initialProducts || [];

  const categoryProducts = useMemo(() => {
    let result = [...baseProducts];

    if (activeSubcategory) {
      result = result.filter((p) => p.subcategorySlug === activeSubcategory);
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
  }, [slug, activeSubcategory, filters]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.nav.allProducts, href: locale === 'ar' ? '/products' : '/en/products' },
    { label: currentCategory.name[locale] },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: dict.nav.allProducts,
      url: locale === 'ar' ? `${siteConfig.url}/products` : `${siteConfig.url}/en/products`,
    },
    {
      name: currentCategory.name[locale],
      url:
        locale === 'ar'
          ? `${siteConfig.url}/category/${slug}`
          : `${siteConfig.url}/en/category/${slug}`,
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

          {/* Category Banner Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FAF3ED] via-[#F4ECE2] to-[#EAE0D3] border border-[#E2D5C4] mb-8 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-start">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#25211E] mb-2">
                {currentCategory.name[locale]}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {currentCategory.description[locale]}
              </p>
            </div>

            <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-white shrink-0">
              <Image
                src={currentCategory.image}
                alt={currentCategory.name[locale]}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Subcategory Pills */}
          {currentCategory.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
              <button
                onClick={() => setActiveSubcategory(undefined)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  !activeSubcategory
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-subtle text-text-secondary hover:bg-surface border border-border'
                }`}
              >
                {locale === 'ar' ? 'جميع التشكيلات' : 'All Subcategories'}
              </button>

              {currentCategory.subcategories.map((sub) => {
                const isSelected = activeSubcategory === sub.slug;
                return (
                  <button
                    key={sub.id}
                    onClick={() =>
                      setActiveSubcategory(isSelected ? undefined : sub.slug)
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface border border-border'
                    }`}
                  >
                    {sub.name[locale]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 p-3.5 bg-surface-subtle border border-border/80 rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden font-bold text-xs"
              >
                <SlidersHorizontal className="w-4 h-4 me-1.5" />
                <span>{dict.category.filters}</span>
              </Button>

              <span className="text-xs font-semibold text-text-muted">
                <span className="font-bold text-text-main">{categoryProducts.length}</span>{' '}
                {dict.category.productCount}
              </span>
            </div>

            <SortDropdown
              locale={locale}
              value={filters.sortBy}
              onChange={(sortVal) => setFilters({ ...filters, sortBy: sortVal })}
            />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="hidden lg:block lg:col-span-3 p-5 bg-surface rounded-2xl border border-border/80 shadow-xs sticky top-36">
              <CategoryFilters
                locale={locale}
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => {
                  setFilters({ category: slug, sortBy: 'popular' });
                  setActiveSubcategory(undefined);
                }}
              />
            </div>

            <div className="lg:col-span-9">
              <ProductGrid products={categoryProducts} locale={locale} />
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
          onReset={() => {
            setFilters({ category: slug, sortBy: 'popular' });
            setActiveSubcategory(undefined);
          }}
          productCount={categoryProducts.length}
        />
      </div>
    </>
  );
}

export function CategoryPageView(props: CategoryPageViewProps) {
  return (
    <Suspense fallback={<div className="py-6 bg-surface min-h-[80vh]" />}>
      <CategoryPageContent {...props} />
    </Suspense>
  );
}

