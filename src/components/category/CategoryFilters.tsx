'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { categories as defaultCategories } from '@/data/categories';
import { ProductFilterState } from '@/types/product';
import { Category } from '@/types/category';
import { getCategorySlugForLocale, decodeHtmlEntities } from '@/lib/wordpress/store-api';
import { RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  locale: Locale;
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  categories?: Category[];
  activeCategorySlug?: string;
  className?: string;
}

function cleanTitle(str?: string): string {
  if (!str) return '';
  let cleaned = decodeHtmlEntities(str);
  if (cleaned.includes('%')) {
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch {}
  }
  return cleaned;
}

export function CategoryFilters({
  locale,
  filters,
  onFilterChange,
  onReset,
  categories: dynamicCategories,
  activeCategorySlug,
  className,
}: CategoryFiltersProps) {
  const dict = getDictionary(locale);

  const displayCategories =
    dynamicCategories && dynamicCategories.length > 0
      ? dynamicCategories
      : defaultCategories;

  const currentActiveSlug = (activeCategorySlug || filters.category || '').trim().toLowerCase();
  const isAllProductsActive = !currentActiveSlug || currentActiveSlug === 'all';

  const DEFAULT_VISIBLE_COUNT = 8;

  // Check if active category is beyond default count to auto-expand
  const activeCatIndex = displayCategories.findIndex((cat) => {
    const arSlug = getCategorySlugForLocale(cat.slug, 'ar').toLowerCase();
    const enSlug = getCategorySlugForLocale(cat.slug, 'en').toLowerCase();
    const catSlug = cat.slug.toLowerCase();
    const catId = cat.id.toString().toLowerCase();
    return (
      currentActiveSlug &&
      (currentActiveSlug === catSlug ||
        currentActiveSlug === catId ||
        currentActiveSlug === arSlug ||
        currentActiveSlug === enSlug ||
        (cat.name.en && cat.name.en.toLowerCase() === currentActiveSlug) ||
        (cat.name.ar && cat.name.ar.toLowerCase() === currentActiveSlug))
    );
  });

  const [isExpanded, setIsExpanded] = useState(() => activeCatIndex >= DEFAULT_VISIBLE_COUNT);

  const visibleCategories = isExpanded ? displayCategories : displayCategories.slice(0, DEFAULT_VISIBLE_COUNT);

  const handlePriceChange = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const priceRanges = [
    { label: locale === 'ar' ? 'الكل' : 'All Prices', min: undefined, max: undefined },
    { label: locale === 'ar' ? 'أقل من 150 ر.س' : 'Under 150 ر.س', min: 0, max: 150 },
    { label: locale === 'ar' ? '150 إلى 250 ر.س' : '150 to 250 ر.س', min: 150, max: 250 },
    { label: locale === 'ar' ? '250 إلى 350 ر.س' : '250 to 350 ر.س', min: 250, max: 350 },
    { label: locale === 'ar' ? '350 إلى 500 ر.س' : '350 to 500 ر.س', min: 350, max: 500 },
    { label: locale === 'ar' ? '500 إلى 750 ر.س' : '500 to 750 ر.س', min: 500, max: 750 },
    { label: locale === 'ar' ? 'أكثر من 750 ر.س' : 'Above 750 ر.س', min: 750, max: undefined },
  ];

  const allProductsUrl = locale === 'ar' ? '/products' : '/en/products';

  return (
    <aside aria-label="Catalog Filters" className={cn('space-y-4 text-start select-none', className)}>
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
          {dict.category.filters}
        </h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{dict.category.clearAll}</span>
        </button>
      </div>

      {/* Categories Filter / Quick Category Switcher */}
      <div>
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
          {dict.footer.categories}
        </h4>
        <div
          className={cn(
            'space-y-1',
            isExpanded &&
              'max-h-48 overflow-y-auto pe-1.5 custom-scrollbar'
          )}
        >
          <Link
            href={allProductsUrl}
            className={cn(
              'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
              isAllProductsActive
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
            )}
          >
            <span>{dict.nav.allProducts}</span>
            {isAllProductsActive && <Check className="w-3.5 h-3.5" />}
          </Link>

          {visibleCategories.map((cat) => {
            const arSlug = getCategorySlugForLocale(cat.slug, 'ar');
            const enSlug = getCategorySlugForLocale(cat.slug, 'en');
            const decodedCatSlug = decodeURIComponent(cat.slug).toLowerCase();
            const decodedCatId = cat.id.toString().toLowerCase();
            const decodedArSlug = decodeURIComponent(arSlug).toLowerCase();
            const decodedEnSlug = decodeURIComponent(enSlug).toLowerCase();

            const isSelected = Boolean(
              currentActiveSlug &&
              (currentActiveSlug === decodedCatSlug ||
                currentActiveSlug === decodedCatId ||
                currentActiveSlug === decodedArSlug ||
                currentActiveSlug === decodedEnSlug ||
                (cat.name.en && cat.name.en.toLowerCase() === currentActiveSlug) ||
                (cat.name.ar && cat.name.ar.toLowerCase() === currentActiveSlug))
            );

            const categoryUrl =
              locale === 'ar'
                ? `/category/${arSlug}`
                : `/en/category/${enSlug}`;

            return (
              <Link
                key={cat.id}
                href={categoryUrl}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
                )}
              >
                <span className="truncate">{cleanTitle(cat.name[locale] || cat.name.en)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ms-1" />}
              </Link>
            );
          })}
        </div>

        {/* More / Less Categories Toggle */}
        {displayCategories.length > DEFAULT_VISIBLE_COUNT && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 mt-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'عرض أقل' : 'Show Less'}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>
                  {locale === 'ar'
                    ? `+ المزيد (${displayCategories.length - DEFAULT_VISIBLE_COUNT})`
                    : `+ More (${displayCategories.length - DEFAULT_VISIBLE_COUNT})`}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Price Range Filter (Compact 2-col Grid) */}
      <div className="pt-3 border-t border-border">
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
          {dict.category.priceRange}
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {priceRanges.map((range, idx) => {
            const isSelected =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            const isAll = idx === 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePriceChange(range.min, range.max)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-start border',
                  isAll && 'col-span-2',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-text-secondary border-border/70 hover:bg-surface-subtle hover:text-text-main hover:border-primary/40'
                )}
              >
                <span className="truncate">{range.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ms-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
