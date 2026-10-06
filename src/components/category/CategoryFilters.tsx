'use client';

import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { categories as defaultCategories } from '@/data/categories';
import { ProductFilterState } from '@/types/product';
import { Category } from '@/types/category';
import { getCategorySlugForLocale, decodeHtmlEntities, isCategoryMatch } from '@/lib/wordpress/store-api';
import { RotateCcw, Check } from 'lucide-react';
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
  return decodeHtmlEntities(str);
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

  const handlePriceChange = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleInStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  const handleRatingChange = (rating?: number) => {
    onFilterChange({ ...filters, minRating: filters.minRating === rating ? undefined : rating });
  };

  const priceRanges = [
    { label: locale === 'ar' ? 'الكل' : 'All Prices', min: undefined, max: undefined },
    { label: locale === 'ar' ? 'أقل من 200 ر.س' : 'Under 200 ر.س', min: 0, max: 200 },
    { label: locale === 'ar' ? '200 إلى 350 ر.س' : '200 to 350 ر.س', min: 200, max: 350 },
    { label: locale === 'ar' ? '350 إلى 500 ر.س' : '350 to 500 ر.س', min: 350, max: 500 },
    { label: locale === 'ar' ? 'أكثر من 500 ر.س' : 'Above 500 ر.س', min: 500, max: undefined },
  ];

  const allProductsUrl = locale === 'ar' ? '/products' : '/en/products';

  return (
    <aside aria-label="Catalog Filters" className={cn('space-y-6 text-start select-none', className)}>
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
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
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
          {dict.footer.categories}
        </h4>
        <div className="space-y-1.5">
          <Link
            href={allProductsUrl}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
              isAllProductsActive
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
            )}
          >
            <span>{dict.nav.allProducts}</span>
            {isAllProductsActive && <Check className="w-3.5 h-3.5" />}
          </Link>

          {displayCategories.map((cat) => {
            const arSlug = getCategorySlugForLocale(cat.slug, 'ar');
            const enSlug = getCategorySlugForLocale(cat.slug, 'en');

            const isSelected = Boolean(
              currentActiveSlug && isCategoryMatch(cat, currentActiveSlug)
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
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
                )}
              >
                <span>{cleanTitle(cat.name[locale] || cat.name.en)}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
          {dict.category.priceRange}
        </h4>
        <div className="space-y-1.5">
          {priceRanges.map((range, idx) => {
            const isSelected =
              filters.minPrice === range.min && filters.maxPrice === range.max;

            return (
              <button
                key={idx}
                onClick={() => handlePriceChange(range.min, range.max)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
                )}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
