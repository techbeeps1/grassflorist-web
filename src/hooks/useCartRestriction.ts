'use client';

import { useMemo } from 'react';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { CartItem } from '@/types/cart';
import { type Locale } from '@/config/site';

export interface CartRestrictionResult {
  isBlocked: boolean;
  hasRestricted: boolean;
  hasQualifying: boolean;
  message: string;
  restrictedItems: CartItem[];
  restrictedCategoryIds: number[];
  qualifyingCategoryIds: number[];
}

export function useCartRestriction(cartItems: CartItem[], locale: Locale = 'ar'): CartRestrictionResult {
  const { data: globalSettings } = useGetGlobalSettingsQuery();

  return useMemo(() => {
    const config = globalSettings?.restricted_categories;

    const defaultResult: CartRestrictionResult = {
      isBlocked: false,
      hasRestricted: false,
      hasQualifying: false,
      message: '',
      restrictedItems: [],
      restrictedCategoryIds: [],
      qualifyingCategoryIds: [],
    };

    if (!config || !config.enabled) {
      return defaultResult;
    }

    const restrictedCatIds = Array.isArray(config.restricted_category_ids)
      ? config.restricted_category_ids.map(Number).filter(Boolean)
      : [];

    const qualifyingCatIds = Array.isArray(config.qualifying_category_ids)
      ? config.qualifying_category_ids.map(Number).filter(Boolean)
      : [];

    if (restrictedCatIds.length === 0) {
      return defaultResult;
    }

    let hasRestricted = false;
    let hasQualifying = false;
    const restrictedItems: CartItem[] = [];

    for (const item of cartItems) {
      // 1. Subscription items always count as qualifying floral products
      if (item.isSubscription) {
        hasQualifying = true;
        continue;
      }

      // 2. Extract item's category IDs
      const rawCatIds: number[] = [];
      if (Array.isArray(item.product?.categoryIds)) {
        rawCatIds.push(...item.product.categoryIds.map(Number).filter(Boolean));
      }
      if (Array.isArray(item.product?.categoriesList)) {
        rawCatIds.push(...item.product.categoriesList.map((c: any) => Number(c?.id)).filter(Boolean));
      }
      if (Array.isArray((item as any).category_ids)) {
        rawCatIds.push(...(item as any).category_ids.map(Number).filter(Boolean));
      }

      const itemCatIds = Array.from(new Set(rawCatIds));

      // 3. Check if qualifying
      if (qualifyingCatIds.length > 0) {
        if (itemCatIds.some((id) => qualifyingCatIds.includes(id))) {
          hasQualifying = true;
        }
      } else {
        // When no specific qualifying categories are set, ANY item not belonging to restricted categories qualifies
        if (itemCatIds.length > 0 && !itemCatIds.some((id) => restrictedCatIds.includes(id))) {
          hasQualifying = true;
        }
      }

      // 4. Check if restricted
      if (itemCatIds.some((id) => restrictedCatIds.includes(id))) {
        // If the item doesn't explicitly belong to a qualifying category, count as restricted add-on
        if (qualifyingCatIds.length === 0 || !itemCatIds.some((id) => qualifyingCatIds.includes(id))) {
          hasRestricted = true;
          restrictedItems.push(item);
        }
      }
    }

    const isBlocked = hasRestricted && !hasQualifying && cartItems.length > 0;

    const defaultMsgEn =
      'You must add at least one flower product to your cart before adding cake, chocolates, or balloons.';
    const defaultMsgAr =
      'يجب إضافة منتج زهور واحد على الأقل إلى سلتك قبل إضافة الكيك أو الشوكولاتة أو البالونات.';

    const message = isBlocked
      ? (locale === 'ar'
          ? config.message?.ar || config.message?.en || defaultMsgAr
          : config.message?.en || config.message?.ar || defaultMsgEn)
      : '';

    return {
      isBlocked,
      hasRestricted,
      hasQualifying,
      message,
      restrictedItems,
      restrictedCategoryIds: restrictedCatIds,
      qualifyingCategoryIds: qualifyingCatIds,
    };
  }, [cartItems, globalSettings, locale]);
}
