'use client';

import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface SortDropdownProps {
  locale: Locale;
  value?: SortOption;
  onChange: (sortVal: SortOption) => void;
}

export function SortDropdown({ locale, value = 'popular', onChange }: SortDropdownProps) {
  const dict = getDictionary(locale);

  return (
    <div className="relative inline-flex items-center gap-2 select-none">
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-muted">
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>{dict.category.sortBy}:</span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label={dict.category.sortBy}
        className="h-10 px-3.5 pe-8 text-xs font-semibold bg-surface border border-border rounded-xl text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
      >
        <option value="popular">{dict.category.sortPopular}</option>
        <option value="price-asc">{dict.category.sortPriceAsc}</option>
        <option value="price-desc">{dict.category.sortPriceDesc}</option>
        <option value="rating">{dict.category.sortRating}</option>
        <option value="newest">{dict.category.sortNewest}</option>
      </select>
    </div>
  );
}
