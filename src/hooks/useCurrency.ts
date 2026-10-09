'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveCurrency, SupportedCurrency } from '@/store/slices/uiSlice';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { type Locale } from '@/config/site';

export function useCurrency(locale: Locale = 'ar') {
  const dispatch = useAppDispatch();
  const currentCurrency = useAppSelector((state) => state.ui.activeCurrency) || 'SAR';
  const { data: globalSettings } = useGetGlobalSettingsQuery();

  // Initialize currency from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grass_active_currency');
      if (saved === 'USD' || saved === 'SAR') {
        if (saved !== currentCurrency) {
          dispatch(setActiveCurrency(saved));
        }
      }
    } catch {
      // Ignore
    }
  }, [dispatch, currentCurrency]);

  const sarToUsdRate = Number(globalSettings?.currency?.sar_to_usd_rate ?? 0.2667);

  const switchCurrency = (newCurrency: SupportedCurrency) => {
    dispatch(setActiveCurrency(newCurrency));
  };

  /**
   * Convert an amount given in SAR to current active currency (USD or SAR)
   */
  const convertAmount = (sarAmount: number): number => {
    if (!sarAmount || isNaN(sarAmount)) return 0;
    if (currentCurrency === 'USD') {
      return Math.round(sarAmount * sarToUsdRate * 100) / 100;
    }
    return sarAmount;
  };

  /**
   * Format converted price with symbol
   */
  const formatPrice = (sarAmount: number): string => {
    const converted = convertAmount(sarAmount);
    if (currentCurrency === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    return `${converted} ${locale === 'ar' ? 'ر.س' : 'SAR'}`;
  };

  /**
   * Currency Symbol display string or icon representation
   */
  const symbol = currentCurrency === 'USD' ? '$' : (locale === 'ar' ? 'ر.س' : 'SAR');

  return {
    currency: currentCurrency,
    isUSD: currentCurrency === 'USD',
    isSAR: currentCurrency === 'SAR',
    switchCurrency,
    setCurrency: switchCurrency,
    sarToUsdRate,
    convertAmount,
    formatPrice,
    symbol,
  };
}
