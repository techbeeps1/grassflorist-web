'use client';

import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { categories } from '@/data/categories';
import { ProductFilterState } from '@/types/product';
import { Star, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  locale: Locale;
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  className?: string;
}

export function CategoryFilters({
  locale,
  filters,
  onFilterChange,
  onReset,
  className,
}: CategoryFiltersProps) {
  const dict = getDictionary(locale);

  const handleCategoryChange = (slug?: string) => {
    onFilterChange({ ...filters, category: slug });
  };

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
    { label: locale === 'ar' ? 'أقل من 200 ر.س' : 'Under 200 SAR', min: 0, max: 200 },
    { label: locale === 'ar' ? '200 إلى 350 ر.س' : '200 to 350 SAR', min: 200, max: 350 },
    { label: locale === 'ar' ? '350 إلى 500 ر.س' : '350 to 500 SAR', min: 350, max: 500 },
    { label: locale === 'ar' ? 'أكثر من 500 ر.س' : 'Above 500 SAR', min: 500, max: undefined },
  ];

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

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
          {dict.footer.categories}
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
              !filters.category
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
            )}
          >
            <span>{dict.nav.allProducts}</span>
            {!filters.category && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
                )}
              >
                <span>{cat.name[locale]}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
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

      {/* In Stock Availability Toggle */}
      <div className="pt-4 border-t border-border">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-bold text-text-main">
            {dict.category.inStockOnly}
          </span>
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={handleInStockToggle}
            className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
          />
        </label>
      </div>

      {/* Minimum Rating Filter */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
          {dict.product.rating}
        </h4>
        <button
          onClick={() => handleRatingChange(4.8)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
            filters.minRating === 4.8
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
          )}
        >
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>4.8 {locale === 'ar' ? 'فما فوق' : '& Above'}</span>
          </div>
          {filters.minRating === 4.8 && <Check className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}
