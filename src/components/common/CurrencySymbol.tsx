'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { type Locale } from '@/config/site';
import { useCurrency } from '@/hooks/useCurrency';

interface CurrencySymbolProps {
  className?: string;
  size?: number;
  forcedCurrency?: 'SAR' | 'USD';
}

export function CurrencySymbol({ className, size = 14, forcedCurrency }: CurrencySymbolProps) {
  const { currency } = useCurrency();
  const activeCurrency = forcedCurrency || currency;

  if (activeCurrency === 'USD') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center font-black text-[#a2c03e] align-middle shrink-0 select-none text-[1.1em] leading-none',
          className
        )}
      >
        $
      </span>
    );
  }

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
  forcedCurrency?: 'SAR' | 'USD';
  showDual?: boolean;
}

export function PriceDisplay({
  amount,
  locale = 'ar',
  className,
  symbolClassName = 'w-3.5 h-3.5',
  originalAmount,
  forcedCurrency,
  showDual = false,
}: PriceDisplayProps) {
  const { currency, convertAmount } = useCurrency(locale);
  const activeCurrency = forcedCurrency || currency;

  const displayAmount = activeCurrency === 'USD' ? convertAmount(amount) : amount;
  // Use en-US standard Latin numerals so numbers like 77.08 or 289 never render as ٧٧٫٠٨
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: activeCurrency === 'USD' ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(displayAmount);

  const displayOriginal = originalAmount
    ? activeCurrency === 'USD'
      ? convertAmount(originalAmount)
      : originalAmount
    : undefined;

  return (
    <span dir="ltr" className={cn('inline-flex items-center gap-1 font-bold', className)}>
      <CurrencySymbol className={symbolClassName} forcedCurrency={activeCurrency} />
      <span>{formatted}</span>

      {displayOriginal && displayOriginal > displayAmount && (
        <span dir="ltr" className="text-xs text-[#9E9186] line-through font-normal ms-1 inline-flex items-center gap-0.5">
          <CurrencySymbol className="w-2.5 h-2.5 opacity-60" forcedCurrency={activeCurrency} />
          <span>
            {new Intl.NumberFormat('en-US', {
              minimumFractionDigits: activeCurrency === 'USD' ? 2 : 0,
              maximumFractionDigits: 2,
            }).format(displayOriginal)}
          </span>
        </span>
      )}

      {showDual && activeCurrency === 'USD' && (
        <span className="text-[11px] text-gray-500 font-normal ms-1">
          ({amount} SAR)
        </span>
      )}
    </span>
  );
}
