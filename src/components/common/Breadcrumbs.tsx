import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { type Locale } from '@/config/site';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: Locale;
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const isRtl = locale === 'ar';
  const Separator = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="py-3.5 mb-2 select-none">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors font-medium truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-semibold text-text-main truncate max-w-[200px] sm:max-w-none' : ''}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <Separator className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
