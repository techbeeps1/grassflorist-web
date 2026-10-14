'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2, ArrowRight, ArrowLeft, FolderOpen } from 'lucide-react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { formatPrice } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';

interface SearchBarProps {
  locale: Locale;
}

export function SearchBar({ locale }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data, isFetching } = useGetProductsQuery(
    { query: query.length >= 2 ? query : undefined, limit: 5, locale },
    { skip: query.trim().length < 2 }
  );

  const searchResults = data?.products.slice(0, 5) || [];

  const searchCategories = useMemo(() => {
    const list: Array<{ id: string; name: string; slug: string; image?: string }> = [];
    const seenSlugs = new Set<string>();

    // 1. From API data.categories
    if (data?.categories && data.categories.length > 0) {
      for (const cat of data.categories) {
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

    // 2. Supplement/fallback from returned products whose category matches query
    if (query.trim().length >= 2 && searchResults.length > 0) {
      const qLower = query.toLowerCase().trim();
      for (const prod of searchResults) {
        const catNameEn = prod.category?.en || '';
        const catNameAr = prod.category?.ar || '';
        const catSlug = prod.categorySlug || '';

        if (
          catNameEn.toLowerCase().includes(qLower) ||
          catNameAr.toLowerCase().includes(qLower) ||
          catSlug.toLowerCase().includes(qLower)
        ) {
          if (catSlug && !seenSlugs.has(catSlug.toLowerCase())) {
            seenSlugs.add(catSlug.toLowerCase());
            list.push({
              id: `prod-cat-${catSlug}`,
              name: locale === 'ar' ? (catNameAr || catNameEn) : (catNameEn || catNameAr),
              slug: catSlug,
              image: prod.thumbnail,
            });
          }
        }
      }
    }

    return list.slice(0, 3);
  }, [data?.categories, searchResults, query, locale]);

  const hasResults = searchResults.length > 0 || searchCategories.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      const searchPath =
        locale === 'ar'
          ? `/search?q=${encodeURIComponent(query.trim())}`
          : `/en/search?q=${encodeURIComponent(query.trim())}`;
      router.push(searchPath);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };


  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={dict.header.searchPlaceholder}
          aria-label={dict.header.searchPlaceholder}
          className="w-full h-9 sm:h-10 ps-9 sm:ps-10 pe-9 text-xs sm:text-[13px] bg-surface-subtle hover:bg-surface border border-border/80 focus:border-primary focus:bg-surface rounded-full transition-all text-text-main placeholder:text-text-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-2xs"
        />

        <div className="absolute start-3.5 flex items-center pointer-events-none text-text-muted">
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-3 p-1 text-text-muted hover:text-text-main rounded-full cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full start-0 end-0 mt-2 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-slide-up max-h-[80vh] overflow-y-auto">
          {hasResults ? (
            <div>
              {/* Matching Categories as Full Rows */}
              {searchCategories.length > 0 && (
                <div className="p-3 pb-2.5 border-b border-border/70 bg-primary-light/10">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary px-1 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'الأقسام المطابقة' : 'Matching Categories'}
                    </span>
                    <span className="text-[10px] lowercase text-text-muted/70 font-normal">
                      {searchCategories.length} {locale === 'ar' ? 'قسم' : 'found'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {searchCategories.map((category) => {
                      const categoryUrl =
                        locale === 'ar'
                          ? `/category/${category.slug}`
                          : `/en/category/${category.slug}`;

                      return (
                        <Link
                          key={category.id}
                          href={categoryUrl}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-primary-light/40 border border-primary/20 hover:border-primary/50 transition-all group cursor-pointer shadow-2xs"
                        >
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center border border-primary/20">
                            {category.image ? (
                              <Image
                                src={formatStorageUrl(category.image)}
                                alt={category.name}
                                fill
                                sizes="44px"
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <FolderOpen className="w-5 h-5 text-primary" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-text-main group-hover:text-primary transition-colors truncate">
                              {category.name}
                            </h4>
                          </div>

                          <div className="shrink-0 text-primary/70 group-hover:text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all pe-1">
                            <ArrowIcon className="w-4 h-4" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              {searchResults.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5">
                    {locale === 'ar' ? 'المنتجات المقترحة' : 'Suggested Products'}
                  </div>
                  <div className="divide-y divide-border/60">
                    {searchResults.map((product) => {
                      const productUrl =
                        locale === 'ar'
                          ? `/product/${product.slug.ar}`
                          : `/en/product/${product.slug.en}`;

                      return (
                        <Link
                          key={product.id}
                          href={productUrl}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-subtle transition-colors group"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-subtle">
                            <Image
                              src={formatStorageUrl(product.thumbnail)}
                              alt={product.name[locale]}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                              {product.name[locale]}
                            </h4>
                            <p className="text-[11px] text-text-muted truncate">
                              {product.category[locale]}
                            </p>
                          </div>
                          <div dir="ltr" className="text-xs sm:text-sm font-bold text-primary shrink-0 inline-flex items-center gap-1">
                            <CurrencySymbol className="w-3.5 h-3.5" />
                            <span>{product.price}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-border">
                    <button
                      onClick={handleSubmit}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary hover:text-primary-hover hover:bg-primary-light/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>
                        {locale === 'ar'
                          ? `عرض كافة النتائج لـ "${query}"`
                          : `View all results for "${query}"`}
                      </span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-text-muted">
              {locale === 'ar'
                ? `لم يتم العثور على منتجات أو أقسام تطابق "${query}"`
                : `No products or categories match "${query}"`}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
