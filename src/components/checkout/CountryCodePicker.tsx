'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface CountryCodeItem {
  iso: string;
  dialCode: string;
  nameEn: string;
  nameAr: string;
  flag: string;
}

export const ALL_COUNTRY_CODES: CountryCodeItem[] = [
  // GCC & Middle East Priority
  { iso: 'SA', dialCode: '+966', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { iso: 'AE', dialCode: '+971', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { iso: 'KW', dialCode: '+965', nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { iso: 'QA', dialCode: '+974', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { iso: 'BH', dialCode: '+973', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { iso: 'OM', dialCode: '+968', nameEn: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { iso: 'EG', dialCode: '+20', nameEn: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { iso: 'JO', dialCode: '+962', nameEn: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { iso: 'LB', dialCode: '+961', nameEn: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
  { iso: 'IQ', dialCode: '+964', nameEn: 'Iraq', nameAr: 'العراق', flag: '🇮🇶' },
  { iso: 'YE', dialCode: '+967', nameEn: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪' },
  { iso: 'MA', dialCode: '+212', nameEn: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { iso: 'DZ', dialCode: '+213', nameEn: 'Algeria', nameAr: 'الجزائر', flag: '🇩🇿' },
  { iso: 'TN', dialCode: '+216', nameEn: 'Tunisia', nameAr: 'تونس', flag: '🇹🇳' },
  { iso: 'SD', dialCode: '+249', nameEn: 'Sudan', nameAr: 'السودان', flag: '🇸🇩' },
  { iso: 'SY', dialCode: '+963', nameEn: 'Syria', nameAr: 'سوريا', flag: '🇸🇾' },
  { iso: 'PS', dialCode: '+970', nameEn: 'Palestine', nameAr: 'فلسطين', flag: '🇵🇸' },
  { iso: 'LY', dialCode: '+218', nameEn: 'Libya', nameAr: 'ليبيا', flag: '🇱🇾' },

  // Major International & Examples from WooCommerce
  { iso: 'US', dialCode: '+1', nameEn: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { iso: 'GB', dialCode: '+44', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
  { iso: 'CA', dialCode: '+1', nameEn: 'Canada', nameAr: 'كندا', flag: '🇨🇦' },
  { iso: 'IN', dialCode: '+91', nameEn: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { iso: 'PK', dialCode: '+92', nameEn: 'Pakistan', nameAr: 'باكستان', flag: '🇵🇰' },
  { iso: 'BD', dialCode: '+880', nameEn: 'Bangladesh', nameAr: 'بنغلاديش', flag: '🇧🇩' },
  { iso: 'PH', dialCode: '+63', nameEn: 'Philippines', nameAr: 'الفلبين', flag: '🇵🇭' },
  { iso: 'TR', dialCode: '+90', nameEn: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷' },
  { iso: 'DE', dialCode: '+49', nameEn: 'Germany', nameAr: 'ألمانيا', flag: '🇩🇪' },
  { iso: 'FR', dialCode: '+33', nameEn: 'France', nameAr: 'فرنسا', flag: '🇫🇷' },
  { iso: 'IT', dialCode: '+39', nameEn: 'Italy', nameAr: 'إيطاليا', flag: '🇮🇹' },
  { iso: 'ES', dialCode: '+34', nameEn: 'Spain', nameAr: 'إسبانيا', flag: '🇪🇸' },
  { iso: 'NL', dialCode: '+31', nameEn: 'Netherlands', nameAr: 'هولندا', flag: '🇳🇱' },
  { iso: 'SE', dialCode: '+46', nameEn: 'Sweden', nameAr: 'السويد', flag: '🇸🇪' },
  { iso: 'CH', dialCode: '+41', nameEn: 'Switzerland', nameAr: 'سويسرا', flag: '🇨🇭' },
  { iso: 'AU', dialCode: '+61', nameEn: 'Australia', nameAr: 'أستراليا', flag: '🇦🇺' },
  { iso: 'NZ', dialCode: '+64', nameEn: 'New Zealand', nameAr: 'نيوزيلندا', flag: '🇳🇿' },
  { iso: 'MY', dialCode: '+60', nameEn: 'Malaysia', nameAr: 'ماليزيا', flag: '🇲🇾' },
  { iso: 'ID', dialCode: '+62', nameEn: 'Indonesia', nameAr: 'إندونيسيا', flag: '🇮🇩' },
  { iso: 'SG', dialCode: '+65', nameEn: 'Singapore', nameAr: 'سنغافورة', flag: '🇸🇬' },
  { iso: 'CN', dialCode: '+86', nameEn: 'China', nameAr: 'الصين', flag: '🇨🇳' },
  { iso: 'JP', dialCode: '+81', nameEn: 'Japan', nameAr: 'اليابان', flag: '🇯🇵' },
  { iso: 'KR', dialCode: '+82', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', flag: '🇰🇷' },
  { iso: 'RU', dialCode: '+7', nameEn: 'Russia', nameAr: 'روسيا', flag: '🇷🇺' },
  { iso: 'BR', dialCode: '+55', nameEn: 'Brazil', nameAr: 'البرازيل', flag: '🇧🇷' },
  { iso: 'ZA', dialCode: '+27', nameEn: 'South Africa', nameAr: 'جنوب أفريقيا', flag: '🇿🇦' },

  // Countries matching user screenshot
  { iso: 'WS', dialCode: '+685', nameEn: 'Samoa', nameAr: 'ساموا', flag: '🇼🇸' },
  { iso: 'SM', dialCode: '+378', nameEn: 'San Marino', nameAr: 'سان مارينو', flag: '🇸🇲' },
  { iso: 'SN', dialCode: '+221', nameEn: 'Senegal', nameAr: 'السنغال', flag: '🇸🇳' },
];

interface CountryCodePickerProps {
  value: string; // e.g. '+966'
  onChange: (item: CountryCodeItem) => void;
  locale?: 'ar' | 'en';
}

export function CountryCodePicker({ value, onChange, locale = 'en' }: CountryCodePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected item resolver
  const selectedItem = useMemo(() => {
    return (
      ALL_COUNTRY_CODES.find((c) => c.dialCode === value) ||
      ALL_COUNTRY_CODES.find((c) => c.iso === 'SA') ||
      ALL_COUNTRY_CODES[0]
    );
  }, [value]);

  // Filtered countries based on search term
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_COUNTRY_CODES;

    return ALL_COUNTRY_CODES.filter((c) => {
      return (
        c.iso.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.includes(q)
      );
    });
  }, [search]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (country: CountryCodeItem) => {
    onChange(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-11 px-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-between gap-2 text-xs font-semibold text-gray-800 transition-all cursor-pointer min-w-[115px] sm:min-w-[125px] shadow-2xs select-none focus:outline-none focus:border-[#8fae2a]"
        aria-label="Select Country Code"
      >
        <span dir="ltr" className="font-bold tracking-tight">
          {selectedItem.iso} {selectedItem.dialCode}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <img
            src={`https://flagicons.lipis.dev/flags/4x3/${selectedItem.iso.toLowerCase()}.svg`}
            alt={selectedItem.nameEn}
            className="w-5 h-3.5 object-cover rounded-xs border border-gray-200/80 shadow-2xs inline-block"
            loading="lazy"
          />
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full start-0 mt-1.5 w-64 sm:w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in text-start">
          {/* Search Header matching screenshot */}
          <div className="p-2.5 bg-[#F2F2F2] border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                className="w-full h-8 px-2.5 pe-8 text-xs bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8fae2a] focus:ring-1 focus:ring-[#8fae2a]/30 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute end-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Scrollable Countries List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100/60 scrollbar-thin">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.dialCode === selectedItem.dialCode && c.iso === selectedItem.iso;
                return (
                  <div
                    key={`${c.iso}-${c.dialCode}`}
                    onClick={() => handleSelect(c)}
                    className={`flex items-center justify-between px-3.5 py-2 text-xs transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#8fae2a] text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    <span dir="ltr" className="tracking-tight">
                      {c.iso} {c.dialCode}
                    </span>
                    <img
                      src={`https://flagicons.lipis.dev/flags/4x3/${c.iso.toLowerCase()}.svg`}
                      alt={c.nameEn}
                      className="w-5 h-3.5 object-cover rounded-xs border border-gray-200/60 shadow-2xs inline-block"
                      loading="lazy"
                    />
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                {locale === 'ar' ? 'لا توجد نتائج' : 'No country found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
