import React from 'react';
import { cn } from '@/lib/utils';
import { type Locale } from '@/config/site';

interface CurrencySymbolProps {
  className?: string;
  size?: number;
}

export function CurrencySymbol({ className, size = 14 }: CurrencySymbolProps) {
  return (
    <img
      src="/sar-symbol.png"
      alt="SAR"
      width={size}
      height={size}
      className={cn('inline-block object-contain align-middle -mt-0.5 shrink-0', className)}
    />
  );
}

interface PriceDisplayProps {
  amount: number;
  locale?: Locale;
  className?: string;
  symbolClassName?: string;
  originalAmount?: number;
}

export function PriceDisplay({
  amount,
  locale = 'ar',
  className,
  symbolClassName = 'w-3.5 h-3.5',
  originalAmount,
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span dir="ltr" className={cn('inline-flex items-center gap-1 font-bold', className)}>
      <CurrencySymbol className={symbolClassName} />
      <span>{formatted}</span>
      {originalAmount && originalAmount > amount && (
        <span dir="ltr" className="text-xs text-[#9E9186] line-through font-normal ms-1 inline-flex items-center gap-0.5">
          <CurrencySymbol className="w-2.5 h-2.5 opacity-60" />
          <span>
            {new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(originalAmount)}
          </span>
        </span>
      )}
    </span>
  );
}
