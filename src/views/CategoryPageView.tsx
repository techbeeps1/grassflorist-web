'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useSearchParams } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CategorySlider } from '@/components/home/CategorySlider';
import { CategoryFilters } from '@/components/category/CategoryFilters';
import { SortDropdown } from '@/components/category/SortDropdown';
import { MobileFilterDrawer } from '@/components/category/MobileFilterDrawer';
import { ProductGrid } from '@/components/product/ProductGrid';
import { LoadMorePagination } from '@/components/product/LoadMorePagination';
import { SubcategoryPills } from '@/components/category/SubcategoryPills';
import { Button } from '@/components/ui/Button';
import { categories } from '@/data/categories';
import { ProductFilterState } from '@/types/product';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { SlidersHorizontal } from 'lucide-react';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { CategoryPageSkeleton } from '@/components/category/CategoryPageSkeleton';

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { decodeHtmlEntities, safeDecodeUri, translateEnglishCategoryNameToArabic } from '@/lib/wordpress/store-api';

function cleanTitle(str?: string): string {
  if (!str) return '';
  return safeDecodeUri(decodeHtmlEntities(str));
}

interface CategoryPageViewProps {
  slug: string;
  locale: Locale;
  initialCategory?: Category | null;
  initialProducts?: Product[];
  allCategories?: Category[];
  initialSubcategory?: string;
}

function CategoryPageContent({
  slug,
  locale,
  initialCategory,
  initialProducts,
  allCategories,
  initialSubcategory,
}: CategoryPageViewProps) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();

  const decodedSlug = decodeURIComponent(slug).trim();
  const currentCategory =
    initialCategory ||
    (allCategories && allCategories.find(
      (c) =>
        c.slug === slug ||
        decodeURIComponent(c.slug) === decodedSlug ||
        c.name.ar === decodedSlug ||
        c.name.en.toLowerCase() === decodedSlug.toLowerCase()
    )) ||
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

  const subcategoryParam = initialSubcategory || searchParams?.get('subcategory') || undefined;

  const hasSubcategories = Boolean(
    currentCategory.subcategories && currentCategory.subcategories.length > 0
  );

  const [filters, setFilters] = useState<ProductFilterState>({
    category: slug,
    sortBy: 'popular',
  });

  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(
    subcategoryParam
  );

  // Track previous category and initialSubcategory to only sync on route changes
  const prevSlugRef = useRef(slug);
  const prevServerSubRef = useRef(initialSubcategory);

  useEffect(() => {
    // If the category slug itself changed (navigating to different category)
    if (prevSlugRef.current !== slug) {
      prevSlugRef.current = slug;
      prevServerSubRef.current = initialSubcategory;
      setActiveSubcategory(initialSubcategory || undefined);
      return;
    }

    // If initialSubcategory prop changed externally (e.g. server navigation)
    if (prevServerSubRef.current !== initialSubcategory) {
      prevServerSubRef.current = initialSubcategory;
      setActiveSubcategory(initialSubcategory);
    }
  }, [slug, initialSubcategory]);

  // Loading state when user clicks a category in the slider
  const [isNavigatingCategory, setIsNavigatingCategory] = useState(false);

  // Reset loading state when new category page loads
  useEffect(() => {
    setIsNavigatingCategory(false);
  }, [slug]);

  const subcategorySectionRef = useRef<HTMLDivElement>(null);

  const scrollToProductsIfNeeded = useCallback(() => {
    if (typeof window === 'undefined') return;
    const targetEl = subcategorySectionRef.current;
    if (targetEl) {
      const headerEl = document.querySelector('header');
      const headerOffset = headerEl ? headerEl.offsetHeight + 14 : 90;
      const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
      const targetScroll = Math.max(0, elementPosition - headerOffset);
      // Only scroll down if user was currently above the products section (e.g. at the top looking at slider)
      if (window.scrollY < targetScroll - 40) {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Push clean nested path format: e.g. /en/category/best-seller/for-her
  const handleSubcategorySelect = (subSlug?: string) => {
    setActiveSubcategory(subSlug);
    if (typeof window !== 'undefined') {
      const basePath = locale === 'ar' ? `/category/${slug}` : `/en/category/${slug}`;
      const newPath = subSlug ? `${basePath}/${subSlug}` : basePath;
      window.history.pushState({}, '', newPath);
      scrollToProductsIfNeeded();
    }
  };

  // Only on initial load: smoothly scroll to products if subcategory param was already present
  const initialScrollChecked = useRef(false);
  useEffect(() => {
    if (subcategoryParam && !initialScrollChecked.current) {
      initialScrollChecked.current = true;
      const timer = setTimeout(() => {
        scrollToProductsIfNeeded();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [subcategoryParam, scrollToProductsIfNeeded]);

  // Browser back/forward button support for subcategory clean paths & query params
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const catIdx = parts.indexOf('category');
      if (catIdx !== -1 && parts.length > catIdx + 2) {
        setActiveSubcategory(parts[catIdx + 2]);
      } else {
        const params = new URLSearchParams(window.location.search);
        setActiveSubcategory(params.get('subcategory') || undefined);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const BATCH_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filters, activeSubcategory]);

  const baseProducts = initialProducts || [];

  // Circular Slider categories: Home page slider categories, guaranteeing currentCategory is included
  const sliderCategories = useMemo(() => {
    const list = [...(allCategories && allCategories.length > 0 ? allCategories : categories)];
    if (currentCategory) {
      const decodedCurrentSlug = decodeURIComponent(currentCategory.slug).trim().toLowerCase();
      const currentId = String(currentCategory.id);
      const exists = list.some((c) => {
        const cSlug = decodeURIComponent(c.slug).trim().toLowerCase();
        return (
          String(c.id) === currentId ||
          cSlug === decodedCurrentSlug ||
          (c.name.en && c.name.en.toLowerCase() === decodedCurrentSlug) ||
          (c.name.ar && c.name.ar.toLowerCase() === decodedCurrentSlug)
        );
      });
      if (!exists && currentCategory.image) {
        list.push(currentCategory);
      }
    }
    return list;
  }, [allCategories, currentCategory]);

  const categoryProducts = useMemo(() => {
    let result = [...baseProducts];

    if (activeSubcategory) {
      const activeDecoded = decodeURIComponent(activeSubcategory).toLowerCase().trim();
      const cleanActive = activeDecoded.replace(/[-_\s]+/g, ' ');
      const targetSub = currentCategory.subcategories?.find((s) => {
        const sSlug = decodeURIComponent(s.slug).toLowerCase().trim();
        const cleanSSlug = sSlug.replace(/[-_\s]+/g, ' ');
        const cleanSEn = s.name.en ? s.name.en.toLowerCase().trim().replace(/[-_\s]+/g, ' ') : '';
        const cleanSAr = s.name.ar ? s.name.ar.toLowerCase().trim().replace(/[-_\s]+/g, ' ') : '';
        return (
          sSlug === activeDecoded ||
          String(s.id) === activeSubcategory ||
          cleanSSlug === cleanActive ||
          cleanSEn === cleanActive ||
          cleanSAr === cleanActive
        );
      });
      const targetSubId = targetSub
        ? Number(targetSub.id)
        : !isNaN(Number(activeSubcategory))
        ? Number(activeSubcategory)
        : null;
      const targetSubSlug = targetSub ? targetSub.slug.toLowerCase() : activeDecoded;

      result = result.filter((p) => {
        // 1. Direct ID match from categoryIds
        if (targetSubId !== null && p.categoryIds && p.categoryIds.includes(targetSubId)) {
          return true;
        }

        // 2. Slug match in categorySlugs
        if (
          p.categorySlugs &&
          p.categorySlugs.some((cs) => {
            const dec = decodeURIComponent(cs).toLowerCase().trim();
            const cleanCs = dec.replace(/[-_\s]+/g, ' ');
            return (
              dec === activeDecoded ||
              dec === targetSubSlug ||
              cleanCs === cleanActive
            );
          })
        ) {
          return true;
        }

        // 3. Subcategory object match in categoriesList
        if (
          p.categoriesList &&
          p.categoriesList.some((c) => {
            if (targetSubId !== null && Number(c.id) === targetSubId) return true;
            const cSlug = (c.slug || '').toLowerCase();
            const cEn = (c.slug_en || '').toLowerCase();
            const cAr = (c.slug_ar || '').toLowerCase();
            return (
              cSlug === activeDecoded ||
              cSlug === targetSubSlug ||
              cEn === activeDecoded ||
              cEn === targetSubSlug ||
              cAr === activeDecoded ||
              cAr === targetSubSlug
            );
          })
        ) {
          return true;
        }

        // 4. subcategorySlug or categorySlug
        const subSlug = p.subcategorySlug ? decodeURIComponent(p.subcategorySlug).toLowerCase() : '';
        const catSlug = p.categorySlug ? decodeURIComponent(p.categorySlug).toLowerCase() : '';
        if (
          subSlug === activeDecoded ||
          subSlug === targetSubSlug ||
          catSlug === activeDecoded ||
          catSlug === targetSubSlug
        ) {
          return true;
        }

        // 5. Tags match
        if (
          p.tags &&
          p.tags.some(
            (t) =>
              decodeURIComponent(t).toLowerCase() === activeDecoded ||
              decodeURIComponent(t).toLowerCase() === targetSubSlug
          )
        ) {
          return true;
        }

        return false;
      });
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
  }, [slug, activeSubcategory, filters, baseProducts, currentCategory]);

  const displayedProducts = useMemo(() => {
    return categoryProducts.slice(0, visibleCount);
  }, [categoryProducts, visibleCount]);

  const rawCatTitle = currentCategory.name[locale] || currentCategory.name.en || '';
  const cleanCategoryName = locale === 'ar'
    ? (currentCategory.name.ar && /[\u0600-\u06FF]/.test(currentCategory.name.ar)
      ? cleanTitle(currentCategory.name.ar)
      : translateEnglishCategoryNameToArabic(rawCatTitle, slug))
    : cleanTitle(currentCategory.name.en || currentCategory.name.ar || '');

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.nav.allProducts, href: locale === 'ar' ? '/products' : '/en/products' },
    { label: cleanCategoryName },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: dict.nav.allProducts,
      url: locale === 'ar' ? `${siteConfig.url}/products` : `${siteConfig.url}/en/products`,
    },
    {
      name: cleanCategoryName,
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

          {/* Category Banner / Title Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FAF3ED] via-[#F4ECE2] to-[#EAE0D3] border border-[#E2D5C4] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl text-start">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#25211E] mb-2">
                {cleanCategoryName}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {cleanTitle(currentCategory.description[locale] || currentCategory.description.en || '')}
              </p>
            </div>

            <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-white shrink-0">
              <Image
                src={currentCategory.image}
                alt={cleanCategoryName}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Main Category Discovery Slider (matches Home page slider categories) */}
          <div className="lg:mb-14 sm:mt-0 md:sm-12 my-10">
            <CategorySlider
              locale={locale}
              categories={sliderCategories}
              activeSlug={slug}
              onCategoryNavigate={(targetSlug) => {
                if (targetSlug !== slug) {
                  setIsNavigatingCategory(true);
                }
              }}
              variant="compact"
              hideHeader={true}
              isContained={false}
              className="pt-0 bg-transparent"
            />
          </div>

          {/* Subcategory Pills: commented out as per user request (moved to sidebar filters) */}
          {/*
          {isNavigatingCategory ? (
            <div className="flex items-center gap-2 overflow-hidden py-1 mb-6 animate-pulse">
              <Skeleton className="h-8 w-28 rounded-full bg-[#E5DDD2] shrink-0" />
              <Skeleton className="h-8 w-24 rounded-full bg-[#EAE3D9] shrink-0" />
              <Skeleton className="h-8 w-26 rounded-full bg-[#EAE3D9] shrink-0" />
              <Skeleton className="h-8 w-20 rounded-full bg-[#EAE3D9] shrink-0" />
              <Skeleton className="h-8 w-24 rounded-full bg-[#EAE3D9] shrink-0" />
            </div>
          ) : currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
            <div ref={subcategorySectionRef} className="scroll-mt-24">
              <SubcategoryPills
                subcategories={currentCategory.subcategories}
                activeSubcategory={activeSubcategory}
                onSelect={handleSubcategorySelect}
                locale={locale}
              />
            </div>
          )}
          */}

          {/* Controls Bar */}
          <div
            ref={subcategorySectionRef}
            className="bg-surface-subtle border border-border/80 rounded-2xl p-3 sm:p-3.5 mb-6 sm:mb-8 scroll-mt-24"
          >
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
                  <span className="font-bold text-text-main">{categoryProducts.length}</span>{' '}
                  {dict.category.productCount}
                </span>
              </div>

              {/* Mobile Product Count */}
              <div className="flex sm:hidden items-center justify-between px-1 text-xs font-semibold text-text-muted">
                <span>
                  <span className="font-bold text-text-main">{categoryProducts.length}</span>{' '}
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

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="hidden lg:block lg:col-span-3 p-4 sm:p-5 bg-surface rounded-2xl border border-border/80 shadow-xs sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
              <CategoryFilters
                locale={locale}
                filters={filters}
                onFilterChange={setFilters}
                categories={allCategories}
                activeCategorySlug={slug}
                subcategories={currentCategory.subcategories}
                activeSubcategory={activeSubcategory}
                onSubcategorySelect={handleSubcategorySelect}
                categorySlug={slug}
                onReset={() => {
                  setFilters({ category: slug, sortBy: 'popular' });
                  setActiveSubcategory(undefined);
                  if (typeof window !== 'undefined') {
                    const basePath = locale === 'ar' ? `/category/${slug}` : `/en/category/${slug}`;
                    window.history.pushState({}, '', basePath);
                  }
                }}
              />
            </div>

            <div className="lg:col-span-9">
              {isNavigatingCategory ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <ProductGrid products={displayedProducts} locale={locale} />
                  <LoadMorePagination
                    total={categoryProducts.length}
                    currentCount={visibleCount}
                    onLoadMore={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
                    locale={locale}
                  />
                </>
              )}
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
          activeCategorySlug={slug}
          subcategories={currentCategory.subcategories}
          activeSubcategory={activeSubcategory}
          onSubcategorySelect={handleSubcategorySelect}
          categorySlug={slug}
          onReset={() => {
            setFilters({ category: slug, sortBy: 'popular' });
            setActiveSubcategory(undefined);
            if (typeof window !== 'undefined') {
              const basePath = locale === 'ar' ? `/category/${slug}` : `/en/category/${slug}`;
              window.history.pushState({}, '', basePath);
            }
          }}
          productCount={categoryProducts.length}
        />
      </div>
    </>
  );
}

export function CategoryPageView(props: CategoryPageViewProps) {
  return (
    <Suspense fallback={<CategoryPageSkeleton locale={props.locale} />}>
      <CategoryPageContent {...props} />
    </Suspense>
  );
}

