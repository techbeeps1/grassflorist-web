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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 text-xs font-semibold text-text-main',
        'hover:border-primary hover:text-primary hover:bg-surface-subtle transition-all cursor-pointer select-none',
        className
      )}
      aria-label={`Switch language to ${displayLabel}`}
    >
      <Globe className="w-3.5 h-3.5 text-text-muted" />
      <span>{displayLabel}</span>
    </Link>
  );
}
