'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import {
  ArrowUpDown,
  ChevronDown,
  Check,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface SortDropdownProps {
  locale: Locale;
  value?: SortOption;
  onChange: (sortVal: SortOption) => void;
  className?: string;
}

export function SortDropdown({
  locale,
  value = 'popular',
  onChange,
  className,
}: SortDropdownProps) {
  const dict = getDictionary(locale);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { value: 'popular', label: dict.category.sortPopular, icon: Sparkles },
    { value: 'price-asc', label: dict.category.sortPriceAsc, icon: ArrowUp },
    { value: 'price-desc', label: dict.category.sortPriceDesc, icon: ArrowDown },
    { value: 'rating', label: dict.category.sortRating, icon: Star },
    { value: 'newest', label: dict.category.sortNewest, icon: Clock },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'relative inline-flex items-center gap-2 select-none w-full sm:w-auto',
        className
      )}
    >
      {/* Label (Desktop) */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-muted shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#8C8075]" />
        <span>{dict.category.sortBy}:</span>
      </div>

      {/* Custom Dropdown Trigger */}
      <div className="relative w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={dict.category.sortBy}
          className={cn(
            'h-10 w-full sm:w-auto min-w-[170px] sm:min-w-[195px] flex items-center justify-between gap-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs border text-start outline-none',
            isOpen
              ? 'bg-[#FAF7F2] border-[#435849] ring-2 ring-[#435849]/15 text-[#1E1915]'
              : 'bg-white hover:bg-[#FAF8F5] border-[#DDD3C6] hover:border-[#435849]/60 text-[#1E1915]'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CurrentIcon className="w-3.5 h-3.5 text-[#435849] shrink-0" />
            <span className="truncate">{currentOption.label}</span>
          </div>

          <ChevronDown
            className={cn(
              'w-4 h-4 text-[#8C8075] transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180 text-[#435849]'
            )}
          />
        </button>

        {/* Custom Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-label={dict.category.sortBy}
            className="absolute end-0 top-full mt-1.5 z-50 w-full sm:w-60 bg-white/98 backdrop-blur-md rounded-2xl border border-[#E8DFD3] shadow-[0_12px_32px_rgba(30,25,21,0.12)] p-1.5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          >
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8C8075] tracking-wider border-b border-[#F0ECE4] mb-1 flex items-center justify-between">
              <span>{dict.category.sortBy}</span>
              <span className="text-[9px] font-normal lowercase opacity-70">
                ({sortOptions.length})
              </span>
            </div>

            <div className="space-y-0.5">
              {sortOptions.map((opt) => {
                const isSelected = opt.value === value;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer text-start outline-none',
                      isSelected
                        ? 'bg-[#435849] text-white font-bold shadow-xs'
                        : 'text-[#2C241E] hover:bg-[#FAF8F5] hover:text-[#1E1915] font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-colors',
                          isSelected
                            ? 'text-white'
                            : 'text-[#8C8075] group-hover:text-[#435849]'
                        )}
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0 ms-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

