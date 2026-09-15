'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown, type SortOption } from '@/components/category/SortDropdown';
import { products } from '@/data/products';
import { Search, PackageOpen } from 'lucide-react';

interface SearchPageViewProps {
  locale: Locale;
}

export function SearchPageView({ locale }: SearchPageViewProps) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams?.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

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
    if (!initialQuery.trim()) return [];
    const q = initialQuery.toLowerCase().trim();

    const results = products.filter(
      (p) =>
        p.name.ar.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.description.ar.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q) ||
        p.category.ar.toLowerCase().includes(q) ||
        p.category.en.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );

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
  }, [initialQuery, sortBy]);

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
              className="w-full h-12 ps-12 pe-28 text-sm bg-surface border border-border rounded-full focus:outline-none focus:border-primary shadow-xs"
            />
            <Search className="w-5 h-5 text-text-muted absolute start-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute end-1.5 px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-hover transition-colors cursor-pointer"
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

        {/* Results Info & Sort */}
        {initialQuery && (
          <div className="flex items-center justify-between gap-4 p-4 bg-surface-subtle border border-border/80 rounded-2xl mb-8">
            <span className="text-xs sm:text-sm font-semibold text-text-muted">
              {locale === 'ar' ? 'تم العثور على ' : 'Found '}
              <strong className="text-text-main">{searchResults.length}</strong>{' '}
              {locale === 'ar' ? 'نتيجة لـ' : 'results for'}{' '}
              <span className="text-primary font-bold">&ldquo;{initialQuery}&rdquo;</span>
            </span>

            {searchResults.length > 0 && (
              <SortDropdown locale={locale} value={sortBy} onChange={setSortBy} />
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
