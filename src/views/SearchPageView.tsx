'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown, type SortOption } from '@/components/category/SortDropdown';
import { useGetProductsQuery } from '@/store/api/productsApi';
import Link from 'next/link';
import { Search, PackageOpen, FolderOpen, ArrowRight, ArrowLeft } from 'lucide-react';

interface SearchPageViewProps {
  locale: Locale;
}

function SearchPageContent({ locale }: SearchPageViewProps) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const initialQuery = searchParams?.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const { data, isLoading } = useGetProductsQuery(
    { query: initialQuery, limit: 30, locale },
    { skip: !initialQuery.trim() }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      const searchUrl =
        locale === 'ar'
          ? `/search?q=${encodeURIComponent(queryInput.trim())}`
          : `/en/search?q=${encodeURIComponent(queryInput.trim())}`;
      router.push(searchUrl);
    }
  };

  const searchResults = useMemo(() => {
    if (!data?.products) return [];
    const results = [...data.products];

    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'popular':
      default:
        results.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
    }

    return results;
  }, [data, sortBy]);

  const searchCategories = useMemo(() => {
    const list: Array<{ id: string; name: string; slug: string; image?: string }> = [];
    const seenSlugs = new Set<string>();

    if (data?.categories && data.categories.length > 0) {
      for (const cat of data.categories) {
        if ((cat as any).is_visible === false) continue;

        const catSlug =
          typeof cat.slug === 'object' && cat.slug !== null
            ? (locale === 'ar' ? (cat.slug as any).ar : (cat.slug as any).en)
            : String(cat.slug || '');
        const catName =
          typeof cat.name === 'object' && cat.name !== null
            ? (cat.name[locale] || (cat.name as any).en || (cat.name as any).ar || '')
            : String(cat.name || '');

        if (catSlug && !seenSlugs.has(catSlug.toLowerCase())) {
          seenSlugs.add(catSlug.toLowerCase());
          list.push({
            id: String(cat.id),
            name: catName,
            slug: catSlug,
            image: cat.image,
          });
        }
      }
    }

    return list;
  }, [data?.categories, locale]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: locale === 'ar' ? 'نتائج البحث' : 'Search Results' },
  ];

  const popularKeywords = [
    { ar: 'جوري أحمر', en: 'Red Roses' },
    { ar: 'توليب هولندي', en: 'Dutch Tulips' },
    { ar: 'شوكولاتة سويسرية', en: 'Swiss Chocolates' },
    { ar: 'أوركيد أبيض', en: 'White Orchid' },
    { ar: 'ذكرى زواج', en: 'Anniversary' },
    { ar: 'نباتات داخلية', en: 'Indoor Plants' },
  ];

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Search Bar on Page */}
        <div className="max-w-2xl mx-auto my-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main mb-4">
            {locale === 'ar' ? 'البحث في المتجر' : 'Search Store'}
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={dict.header.searchPlaceholder}
              className="w-full h-12 ps-12 pe-28 pt-[2px] pb-0 text-sm leading-normal bg-surface border border-border rounded-full focus:outline-none focus:border-primary shadow-xs"
            />
            <Search className="w-5 h-5 text-text-muted absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>

          {/* Popular Search Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
            <span className="text-xs text-text-muted me-1">
              {locale === 'ar' ? 'كلمات شائعة:' : 'Popular:'}
            </span>
            {popularKeywords.map((k, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryInput(k[locale]);
                  const searchUrl =
                    locale === 'ar'
                      ? `/search?q=${encodeURIComponent(k.ar)}`
                      : `/en/search?q=${encodeURIComponent(k.en)}`;
                  router.push(searchUrl);
                }}
                className="px-3 py-1 text-xs bg-surface-subtle hover:bg-primary-light hover:text-primary rounded-full transition-colors cursor-pointer border border-border/60"
              >
                {k[locale]}
              </button>
            ))}
          </div>
        </div>

        {/* Matching Categories as Full Rows */}
        {initialQuery && searchCategories.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-surface-subtle border border-border/80 shadow-2xs">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span>{locale === 'ar' ? 'الأقسام المطابقة لبحثك' : 'Categories matching your search'}</span>
              <span className="text-[11px] font-normal text-text-muted">
                ({searchCategories.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {searchCategories.map((category) => {
                const categoryUrl =
                  locale === 'ar'
                    ? `/category/${category.slug}`
                    : `/en/category/${category.slug}`;

                return (
                  <Link
                    key={category.id}
                    href={categoryUrl}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-primary-light/40 border border-border/80 hover:border-primary/50 text-xs sm:text-sm font-semibold text-text-main shadow-2xs transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden relative">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-text-main group-hover:text-primary transition-colors truncate">
                        {category.name}
                      </span>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Info & Sort */}
        {initialQuery && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-surface-subtle border border-border/80 rounded-2xl mb-6 sm:mb-8">
            <span className="text-xs sm:text-sm font-semibold text-text-muted">
              {locale === 'ar' ? 'تم العثور على ' : 'Found '}
              <strong className="text-text-main">{searchResults.length}</strong>{' '}
              {locale === 'ar' ? 'نتيجة لـ' : 'results for'}{' '}
              <span className="text-primary font-bold">&ldquo;{initialQuery}&rdquo;</span>
            </span>

            {searchResults.length > 0 && (
              <div className="w-full sm:w-auto flex justify-end">
                <SortDropdown locale={locale} value={sortBy} onChange={setSortBy} className="w-full sm:w-auto" />
              </div>
            )}
          </div>
        )}

        {/* Grid or Empty State */}
        {initialQuery ? (
          <ProductGrid products={searchResults} locale={locale} />
        ) : (
          <div className="py-16 text-center text-text-muted">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 text-text-muted/60" />
            <p className="text-sm">
              {locale === 'ar'
                ? 'أدخل كلمة البحث أعلاه لاستكشاف باقات الزهور والهدايا المتوفرة.'
                : 'Enter a search term above to explore available blooms and luxury gifts.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchPageView(props: SearchPageViewProps) {
  return (
    <Suspense fallback={<div className="py-6 min-h-[60vh] bg-surface" />}>
      <SearchPageContent {...props} />
    </Suspense>
  );
}

