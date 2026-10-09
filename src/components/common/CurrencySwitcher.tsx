'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { type Locale } from '@/config/site';
import { ChevronDown, Check } from 'lucide-react';
import { SupportedCurrency } from '@/store/slices/uiSlice';

interface CurrencySwitcherProps {
  locale?: Locale;
  className?: string;
  variant?: 'topbar' | 'compact' | 'footer';
}

export function CurrencySwitcher({
  locale = 'ar',
  className = '',
  variant = 'topbar',
}: CurrencySwitcherProps) {
  const { currency, switchCurrency } = useCurrency(locale);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: Array<{
    code: SupportedCurrency;
    label: string;
    flag: string;
    symbol: string;
  }> = [
    {
      code: 'SAR',
      label: locale === 'ar' ? 'ريال سعودي (SAR)' : 'Saudi riyal (SAR)',
      flag: '🇸🇦',
      symbol: 'SAR',
    },
    {
      code: 'USD',
      label: locale === 'ar' ? 'دولار أمريكي (USD)' : 'United States (US) dollar (USD)',
      flag: '🇺🇸',
      symbol: '$',
    },
  ];

  const currentOption = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <div className={`relative inline-block text-start z-50 ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] sm:text-xs font-semibold text-[#25211E] hover:text-[#8fae2a] transition-colors rounded cursor-pointer select-none group"
      >
        <span className="text-xs sm:text-sm leading-none shrink-0">{currentOption.flag}</span>
        <span className="truncate">{currentOption.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#5C524B] group-hover:text-[#25211E] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute end-0 mt-1.5 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-[100] animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
            {locale === 'ar' ? 'اختر العملة' : 'Select Currency'}
          </div>
          {currencies.map((item) => {
            const isSelected = item.code === currency;
            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  switchCurrency(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors cursor-pointer text-start ${
                  isSelected
                    ? 'bg-[#8fae2a]/10 text-gray-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{item.flag}</span>
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#8fae2a] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
