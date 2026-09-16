'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getLocalizedPath } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const pathname = usePathname() || '/';

  const targetLocale: Locale = currentLocale === 'ar' ? 'en' : 'ar';
  const targetPath = getLocalizedPath(pathname, targetLocale);

  // Label to show: if on Arabic, show 'English'; if on English, show 'العربية'
  const displayLabel = targetLocale === 'ar' ? 'العربية' : 'English';

  return (
    <Link
      href={targetPath}
      hrefLang={targetLocale}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#DDD3C6] bg-[#FAF8F5] text-[11px] sm:text-xs font-bold text-[#201B18]',
        'hover:border-[#435849] hover:text-[#435849] hover:bg-[#FAF3ED] shadow-2xs transition-all cursor-pointer select-none shrink-0',
        className
      )}
      aria-label={`Switch language to ${displayLabel}`}
    >
      <Globe className="w-3.5 h-3.5 text-[#5C524B]" />
      <span>{displayLabel}</span>
    </Link>
  );
}
