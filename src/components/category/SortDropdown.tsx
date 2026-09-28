'use client';

import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface SortDropdownProps {
  locale: Locale;
  value?: SortOption;
  onChange: (sortVal: SortOption) => void;
  className?: string;
}

export function SortDropdown({ locale, value = 'popular', onChange, className }: SortDropdownProps) {
  const dict = getDictionary(locale);

  return (
    <div className={cn('relative inline-flex items-center gap-2 select-none w-full sm:w-auto', className)}>
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-muted shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>{dict.category.sortBy}:</span>
      </div>

      <div className="relative w-full sm:w-auto">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          aria-label={dict.category.sortBy}
          className="h-10 w-full appearance-none px-3.5 pe-8 text-xs font-semibold bg-surface border border-border rounded-xl text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors shadow-2xs"
        >
          <option value="popular">{dict.category.sortPopular}</option>
          <option value="price-asc">{dict.category.sortPriceAsc}</option>
          <option value="price-desc">{dict.category.sortPriceDesc}</option>
          <option value="rating">{dict.category.sortRating}</option>
          <option value="newest">{dict.category.sortNewest}</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2.5 text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
