'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/store';
import { selectCartSubtotal } from '@/store/slices/cartSlice';
import { useGetShippingMethodsQuery } from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import { siteConfig, type Locale } from '@/config/site';

export function useCartDynamicTotals(locale: Locale = 'ar') {
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector((state) => state.cart.discountAmount || 0);

  // Dynamic Shipping Methods and rates managed from Filament Admin
  const { data: shippingMethodsData, isLoading: isShippingLoading } = useGetShippingMethodsQuery();
  const isShippingReady = Boolean(shippingMethodsData);
  const shippingMethods = useMemo(() => shippingMethodsData?.data || [], [shippingMethodsData]);
  const activeShippingMethod = useMemo(
    () => shippingMethods.find((m) => m.is_active) || shippingMethods[0],
    [shippingMethods]
  );

  // Dynamic Settings and currency conversion from Global Settings
  const { data: globalSettings, isLoading: isSettingsLoading } = useGetGlobalSettingsQuery();
  const { sarToUsdRate } = useCurrency(locale);

  const vatPercentage = Number(globalSettings?.tax?.vat_percentage ?? 15);
  const isVatIncluded = Boolean(globalSettings?.tax?.is_vat_included);

  const discountedSubtotal = Math.max(0, subtotal - discount);

  const freeShippingThreshold = Number(
    activeShippingMethod?.min_order_for_free_shipping ??
    shippingMethodsData?.free_shipping_threshold ??
    globalSettings?.shipping?.free_shipping_threshold ??
    siteConfig.features.freeShippingThreshold ??
    250
  );

  const isFreeShipping = Boolean(
    activeShippingMethod?.is_free_shipping_eligible &&
    discountedSubtotal >= freeShippingThreshold
  );

  const shippingFee = isFreeShipping
    ? 0
    : Number(
      activeShippingMethod?.price ??
      shippingMethodsData?.default_shipping_fee ??
      globalSettings?.shipping?.inside_jeddah_fee ??
      30
    );

  // If VAT is included in product prices (isVatIncluded):
  // vat is extracted from the discounted subtotal: vat = discountedSubtotal - (discountedSubtotal / (1 + vatRate))
  // total = discountedSubtotal + shippingFee
  // If VAT is excluded (Default / Exclusive):
  // vat is added on top of the subtotal: vat = Math.round(discountedSubtotal * (vatPercentage / 100))
  // total = discountedSubtotal + vat + shippingFee
  const vat = isVatIncluded
    ? Number((discountedSubtotal - discountedSubtotal / (1 + vatPercentage / 100)).toFixed(2))
    : Number((discountedSubtotal * (vatPercentage / 100)).toFixed(2));

  const total = Number((isVatIncluded
    ? discountedSubtotal + shippingFee
    : discountedSubtotal + vat + shippingFee).toFixed(2));

  // USD conversions
  const subtotalUsd = Number((subtotal * sarToUsdRate).toFixed(2));
  const discountUsd = Number((discount * sarToUsdRate).toFixed(2));
  const shippingFeeUsd = Number((shippingFee * sarToUsdRate).toFixed(2));
  const vatUsd = Number((vat * sarToUsdRate).toFixed(2));
  const totalUsd = Number((total * sarToUsdRate).toFixed(2));

  // Localized Labels
  const shippingLabel = activeShippingMethod
    ? (locale === 'ar'
      ? (activeShippingMethod.name_ar || activeShippingMethod.name)
      : (activeShippingMethod.name_en || activeShippingMethod.name))
    : (locale === 'ar' ? 'التوصيل داخل جدة' : 'Delivery Inside Jeddah');

  const vatLabel = locale === 'ar'
    ? `ضريبة القيمة المضافة (${vatPercentage}%)${isVatIncluded ? ' (مشمولة بالأسعار)' : ''}`
    : `Saudi Arabia VAT (${vatPercentage}%)${isVatIncluded ? ' (Included in prices)' : ''}`;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold,
    activeShippingMethod,
    vat,
    vatPercentage,
    isVatIncluded,
    total,
    subtotalUsd,
    discountUsd,
    shippingFeeUsd,
    vatUsd,
    totalUsd,
    shippingLabel,
    vatLabel,
    isShippingReady,
    isShippingLoading,
    isSettingsLoading,
  };
}
