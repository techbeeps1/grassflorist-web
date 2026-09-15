'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { formatPrice } from '@/lib/utils';
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
    { query: query.length >= 2 ? query : undefined, limit: 5 },
    { skip: query.trim().length < 2 }
  );

  const searchResults = data?.products.slice(0, 5) || [];

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

  const popularTags = [
    { ar: 'جوري أحمر', en: 'Red Roses' },
    { ar: 'توليب', en: 'Tulips' },
    { ar: 'شوكولاتة', en: 'Chocolates' },
    { ar: 'أوركيد', en: 'Orchid' },
    { ar: 'نباتات داخلية', en: 'Indoor Plants' },
  ];

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
          className="w-full h-10 sm:h-11 ps-10 pe-9 text-xs sm:text-sm bg-surface-subtle hover:bg-surface border border-border/80 focus:border-primary focus:bg-surface rounded-full transition-all text-text-main placeholder:text-text-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-xs"
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
        <div className="absolute top-full start-0 end-0 mt-2 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-slide-up">
          {searchResults.length > 0 ? (
            <div className="p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5">
                {locale === 'ar' ? 'نتائج مقترحة' : 'Suggested Arrangements'}
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
                          src={product.thumbnail}
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
          ) : (
            <div className="p-6 text-center text-xs text-text-muted">
              {locale === 'ar'
                ? `لم يتم العثور على نتائج تطابق "${query}"`
                : `No floral products match "${query}"`}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[11px] text-text-muted/80 w-full mb-1">
                  {locale === 'ar' ? 'عمليات البحث الشائعة:' : 'Popular searches:'}
                </span>
                {popularTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(tag[locale]);
                      setIsOpen(true);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-surface-subtle hover:bg-primary-light hover:text-primary rounded-full transition-colors cursor-pointer"
                  >
                    {tag[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
