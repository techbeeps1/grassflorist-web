'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { WORLD_COUNTRIES, CountryItem, getCountryFlagUrl, findCountry } from '@/data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string, item: CountryItem) => void;
  locale?: 'ar' | 'en';
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  locale = 'en',
  className = '',
  id,
  disabled = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Resolved selected country
  const selectedCountry = useMemo(() => {
    return findCountry(value) || WORLD_COUNTRIES[0];
  }, [value]);

  // Filtered countries based on search query
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;

    return WORLD_COUNTRIES.filter((c) => {
      return (
        c.code.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.includes(q)
      );
    });
  }, [search]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (item: CountryItem) => {
    // Return standard English name or matching value
    onChange(item.nameEn, item);
    setIsOpen(false);
    setSearch('');
  };

  const displayName = locale === 'ar' ? selectedCountry.nameAr : selectedCountry.nameEn;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 px-3.5 bg-white border rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-between gap-2.5 transition-all text-start select-none shadow-2xs ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200'
            : isOpen
            ? 'border-[#8fae2a] ring-2 ring-[#8fae2a]/20'
            : 'border-gray-200 hover:border-gray-300 cursor-pointer focus:outline-none focus:border-[#8fae2a]'
        } ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={getCountryFlagUrl(selectedCountry.code)}
            alt={selectedCountry.nameEn}
            className="w-5 h-3.5 object-cover rounded-xs border border-gray-200/80 shrink-0 shadow-2xs"
            loading="lazy"
          />
          <span className="truncate">{displayName}</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && !disabled && (
        <div className="absolute top-full start-0 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in text-start">
          {/* Search Header */}
          <div className="p-2 bg-gray-50/90 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث عن دولة...' : 'Search country...'}
                className="w-full h-8.5 px-3 pe-8 text-xs bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8fae2a] focus:ring-1 focus:ring-[#8fae2a]/30 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute end-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Scrollable Countries List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100/60 scrollbar-thin">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <div
                    key={c.code}
                    onClick={() => handleSelect(c)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#8fae2a] text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getCountryFlagUrl(c.code)}
                        alt={c.nameEn}
                        className="w-5 h-3.5 object-cover rounded-xs border border-gray-200/60 shrink-0 shadow-2xs"
                        loading="lazy"
                      />
                      <span className="truncate">
                        {locale === 'ar' ? c.nameAr : c.nameEn}
                        <span className={`text-[10.5px] ms-1.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          ({locale === 'ar' ? c.nameEn : c.nameAr})
                        </span>
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ms-2" />}
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                {locale === 'ar' ? 'لا توجد دولة بهذا الاسم' : 'No country found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
