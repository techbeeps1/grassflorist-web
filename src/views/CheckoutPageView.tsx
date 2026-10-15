'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { siteConfig, type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearCart,
  removeItem,
  updateQuantity,
  applyCoupon,
  setAppliedCoupon,
  removeCoupon,
  selectCartTotals,
} from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { useGetUserOrdersQuery, useGetUserProfileQuery } from '@/store/api/authApi';
import {
  useGetShippingMethodsQuery,
  useGetPaymentMethodsQuery,
  useGetDeliverySlotsQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartActions } from '@/hooks/useCartActions';
import {
  useApplyServerCouponMutation,
  useEmptyCartMutation,
  getLocalizedProductName,
} from '@/store/api/cartApi';
import { formatPrice } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { CheckoutPageSkeleton } from '@/components/checkout/CheckoutPageSkeleton';
import { Order } from '@/types/order';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Lock,
  AlertTriangle,
  AlertCircle,
  X,
  Plus,
  Minus,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Music,
  Gift,
  Sunrise,
  Sunset,
  ChevronDown,
  RotateCw,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { CountryCodePicker, ALL_COUNTRY_CODES } from '@/components/checkout/CountryCodePicker';
import { DeliveryDatePicker } from '@/components/checkout/DeliveryDatePicker';
import { CountrySelect } from '@/components/common/CountrySelect';
import { HyperPayWidgetModal } from '@/components/checkout/HyperPayWidgetModal';
import { TabbyInstallmentModal } from '@/components/checkout/TabbyInstallmentModal';
import { MakeItPerfectModal } from '@/components/checkout/MakeItPerfectModal';

// Dynamically load Leaflet Map to avoid SSR issues
const AddressMapPicker = dynamic(
  () => import('@/components/checkout/AddressMapPicker').then((mod) => mod.AddressMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center text-xs text-text-muted">
        Loading interactive map...
      </div>
    ),
  }
);

interface CheckoutPageViewProps {
  locale: Locale;
}

// Helper to get current date in Saudi Arabia timezone (Asia/Riyadh)
function getSaudiTodayDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Formats as YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function addDaysToDate(dateStr: string, days: number): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d + days));
    return dateObj.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

function formatDisplayDate(dateStr: string, locale: Locale): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

function splitPhone(fullPhone: string): { code: string; number: string } {
  if (!fullPhone) return { code: '+966', number: '' };
  const cleaned = fullPhone.trim();
  const matched = ALL_COUNTRY_CODES.find((c) => cleaned.startsWith(c.dialCode));
  if (matched) {
    return {
      code: matched.dialCode,
      number: cleaned.slice(matched.dialCode.length).replace(/^0+/, ''),
    };
  }
  if (cleaned.startsWith('+')) {
    return { code: '+966', number: cleaned.replace(/^\+966/, '').replace(/^\+/, '') };
  }
  return { code: '+966', number: cleaned.replace(/^0+/, '') };
}

export function CheckoutPageView({ locale }: CheckoutPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const isRtl = locale === 'ar';

  const cartItems = useAppSelector((state) => state.cart.items);
  const hasSubscription = useMemo(() => cartItems.some((i) => i.isSubscription), [cartItems]);
  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const { subtotal, discount, shippingFee: fallbackShippingFee } = useAppSelector(selectCartTotals);
  const user = useAppSelector((state) => state.auth.user);

  // Dynamic Shipping Methods and rates managed from Filament Admin
  const { data: shippingMethodsData } = useGetShippingMethodsQuery();
  const isShippingReady = Boolean(shippingMethodsData);
  const shippingMethods = useMemo(() => shippingMethodsData?.data || [], [shippingMethodsData]);
  const activeShippingMethod = useMemo(
    () => shippingMethods.find((m) => m.is_active) || shippingMethods[0],
    [shippingMethods]
  );

  // Dynamic Settings and currency conversion from Global Settings
  const { data: globalSettings } = useGetGlobalSettingsQuery();
  const { currency: activeCurrency, isUSD, sarToUsdRate } = useCurrency(locale);
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

  // Real-time USD conversions
  const subtotalUsd = Number((subtotal * sarToUsdRate).toFixed(2));
  const discountUsd = Number((discount * sarToUsdRate).toFixed(2));
  const shippingFeeUsd = Number((shippingFee * sarToUsdRate).toFixed(2));
  const vatUsd = Number((vat * sarToUsdRate).toFixed(2));
  const totalUsd = Number((total * sarToUsdRate).toFixed(2));

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const {
    updateQuantity: updateCartActionQty,
    removeItem: removeCartActionItem,
    updatingItemIds,
    removingItemIds,
  } = useCartActions();
  const [applyServerCoupon, { isLoading: isApplyingCoupon }] = useApplyServerCouponMutation();
  const [emptyCart] = useEmptyCartMutation();
  const [couponErrorMessage, setCouponErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [showMakeItPerfectModal, setShowMakeItPerfectModal] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show "Make it perfect" upsell popup once on checkout if user hasn't seen it yet
  useEffect(() => {
    if (hasMounted && cartItems.length > 0) {
      try {
        const hasSeen = sessionStorage.getItem('seen_checkout_make_it_perfect');
        if (!hasSeen) {
          const timer = setTimeout(() => {
            setShowMakeItPerfectModal(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [hasMounted, cartItems.length]);

  const clearCartCompletely = React.useCallback(() => {
    dispatch(clearCart());
    emptyCart().unwrap().catch(() => {});
  }, [dispatch, emptyCart]);

  // Saudi current date as minimum / default date
  const saudiToday = getSaudiTodayDate();

  const quickDates = React.useMemo(() => {
    return [
      {
        dateStr: saudiToday,
        label: locale === 'ar' ? 'اليوم' : 'Today',
        subLabel: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(saudiToday + 'T12:00:00Z')),
      },
      {
        dateStr: addDaysToDate(saudiToday, 1),
        label: locale === 'ar' ? 'غداً' : 'Tomorrow',
        subLabel: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(addDaysToDate(saudiToday, 1) + 'T12:00:00Z')),
      },
      {
        dateStr: addDaysToDate(saudiToday, 2),
        label: locale === 'ar' ? 'بعد غد' : 'Day After',
        subLabel: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(addDaysToDate(saudiToday, 2) + 'T12:00:00Z')),
      },
    ];
  }, [saudiToday, locale]);

  // --- SENDER INFORMATION STATE ---
  const [senderFirstName, setSenderFirstName] = useState('');
  const [senderLastName, setSenderLastName] = useState('');
  const [senderCountry, setSenderCountry] = useState('Saudi Arabia');
  const [senderCountryCode, setSenderCountryCode] = useState('+966');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Prefill sender from authenticated user if available
  useEffect(() => {
    if (user) {
      if (user.name) {
        const parts = user.name.trim().split(' ');
        setSenderFirstName((prev) => prev || parts[0] || '');
        setSenderLastName((prev) => prev || parts.slice(1).join(' ') || '');
      }
      if (user.email) setSenderEmail((prev) => prev || user.email);
      if (user.phone) {
        const parsed = splitPhone(user.phone);
        setSenderCountryCode(parsed.code);
        setSenderPhone((prev) => prev || parsed.number);
      }
    }
  }, [user]);

  // --- SAVED ADDRESSES FOR LOGGED-IN USERS ---
  interface SavedAddressOption {
    id: string;
    label: string;
    recipientFirstName: string;
    recipientLastName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingAddressLink: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
  }

  // --- RECEIVER INFORMATION STATE ---
  const [localAddresses, setLocalAddresses] = useState<SavedAddressOption[]>([]);
  const [deletedAddressKeys, setDeletedAddressKeys] = useState<string[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientCountryCode, setRecipientCountryCode] = useState('+966');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressLink, setShippingAddressLink] = useState('');
  const city = locale === 'ar' ? 'جدة' : 'Jeddah';
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Close custom address dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddressDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Queries for user's past orders and profile
  const userId = user?.id;
  const { data: userOrders } = useGetUserOrdersQuery(userId, {
    skip: !userId,
  });
  const { data: profileUser } = useGetUserProfileQuery(undefined, {
    skip: !userId,
  });

  // Load localStorage saved addresses & deleted keys once when userId changes
  useEffect(() => {
    if (!userId) {
      setLocalAddresses([]);
      setDeletedAddressKeys([]);
      return;
    }
    try {
      const storageKey = `grass_saved_addresses_${userId}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: SavedAddressOption[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocalAddresses(parsed.slice(0, 5));
        }
      }
      const delKey = `grass_deleted_address_keys_${userId}`;
      const rawDel = localStorage.getItem(delKey);
      if (rawDel) {
        const parsedDel = JSON.parse(rawDel);
        if (Array.isArray(parsedDel)) {
          setDeletedAddressKeys(parsedDel);
        }
      }
    } catch {
      // Ignore JSON errors
    }
  }, [userId]);

  // Purely computed saved addresses: MAX 5 recent addresses, ignoring deleted ones
  const savedAddresses = useMemo<SavedAddressOption[]>(() => {
    if (!user) return [];

    const list: SavedAddressOption[] = [];
    const seenKeys = new Set<string>();
    const deletedSet = new Set(deletedAddressKeys);

    // 1. From LocalStorage (most recent first)
    localAddresses.forEach((addr) => {
      const key = `${addr.shippingAddress || ''}_${addr.recipientPhone || ''}`.trim().toLowerCase();
      if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has(addr.id)) {
        seenKeys.add(key);
        list.push(addr);
      }
    });

    // 2. From User Past Orders (up to limit of 5 total)
    if (list.length < 5 && Array.isArray(userOrders) && userOrders.length > 0) {
      for (let idx = 0; idx < userOrders.length; idx++) {
        if (list.length >= 5) break;
        const order = userOrders[idx];
        const rec = order.recipient;
        if (rec && (rec.street || rec.city)) {
          const street = rec.street || '';
          const phone = rec.phone || '';
          const key = `${street}_${phone}`.trim().toLowerCase();
          const orderId = `order_${order.orderNumber || idx}`;
          if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has(orderId)) {
            seenKeys.add(key);
            const nameParts = (rec.name || '').trim().split(' ');
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';
            list.push({
              id: orderId,
              label: `${rec.name || 'Recipient'} - ${street}${rec.district ? `, ${rec.district}` : ''} (${rec.city || 'Jeddah'})`,
              recipientFirstName: fName,
              recipientLastName: lName,
              recipientPhone: phone.replace(/^\+966/, ''),
              shippingAddress: street,
              shippingAddressLink: (order as any).location_link || (order as any).shipping_address_link || '',
              city: rec.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
              district: rec.district || '',
            });
          }
        }
      }
    }

    // 3. From User Profile (if still under 5)
    if (list.length < 5) {
      const activeProfile = profileUser || user;
      if (activeProfile && (activeProfile.street || activeProfile.city)) {
        const street = activeProfile.street || '';
        const phone = activeProfile.phone || '';
        const key = `${street}_${phone}`.trim().toLowerCase();
        if (key && !seenKeys.has(key) && !deletedSet.has(key) && !deletedSet.has('profile_address')) {
          seenKeys.add(key);
          const nameParts = (activeProfile.name || '').trim().split(' ');
          list.push({
            id: 'profile_address',
            label: `${activeProfile.name || 'My Profile'} - ${street}${activeProfile.district ? `, ${activeProfile.district}` : ''} (${activeProfile.city || 'Jeddah'})`,
            recipientFirstName: nameParts[0] || '',
            recipientLastName: nameParts.slice(1).join(' ') || '',
            recipientPhone: (activeProfile.phone || '').replace(/^\+966/, ''),
            shippingAddress: street,
            shippingAddressLink: '',
            city: activeProfile.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
            district: activeProfile.district || '',
          });
        }
      }
    }

    // Keep MAX 5 most recent addresses
    return list.slice(0, 5);
  }, [user, localAddresses, userOrders, profileUser, deletedAddressKeys, locale]);

  // Handler for selecting an address from the saved addresses dropdown
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedSavedAddress(addressId);
    if (!addressId) return;

    const found = savedAddresses.find((a) => a.id === addressId);
    if (found) {
      const fullName = [found.recipientFirstName, found.recipientLastName].filter(Boolean).join(' ').trim();
      if (fullName) setRecipientName(fullName);
      if (found.recipientFirstName) setRecipientFirstName(found.recipientFirstName);
      if (found.recipientLastName) setRecipientLastName(found.recipientLastName);
      if (found.recipientPhone) {
        const parsed = splitPhone(found.recipientPhone);
        setRecipientCountryCode(parsed.code);
        setRecipientPhone(parsed.number);
      }
      if (found.shippingAddress) setShippingAddress(found.shippingAddress);
      if (found.shippingAddressLink) setShippingAddressLink(found.shippingAddressLink);
      if (found.district) setDistrict(found.district);
      if (found.latitude !== undefined) setLatitude(found.latitude);
      if (found.longitude !== undefined) setLongitude(found.longitude);
    }
  };

  // Handler to remove a saved address with the cross icon
  const handleRemoveSavedAddress = (addrToRemove: SavedAddressOption) => {
    if (!user) return;
    const key = `${addrToRemove.shippingAddress || ''}_${addrToRemove.recipientPhone || ''}`.trim().toLowerCase();

    // 1. Add to deleted keys
    const newDeletedKeys = [...deletedAddressKeys, key, addrToRemove.id];
    setDeletedAddressKeys(newDeletedKeys);
    try {
      localStorage.setItem(`grass_deleted_address_keys_${user.id}`, JSON.stringify(newDeletedKeys));
    } catch { }

    // 2. Filter out from localAddresses
    const updatedLocal = localAddresses.filter(
      (a) =>
        a.id !== addrToRemove.id &&
        `${a.shippingAddress || ''}_${a.recipientPhone || ''}`.trim().toLowerCase() !== key
    );
    setLocalAddresses(updatedLocal);
    try {
      localStorage.setItem(`grass_saved_addresses_${user.id}`, JSON.stringify(updatedLocal));
    } catch { }

    // 3. Clear selected if this one was selected
    if (selectedSavedAddress === addrToRemove.id) {
      setSelectedSavedAddress('');
    }
  };

  // Helper to persist address into user saved list (MAX 5 RECENT: automatically drops the oldest)
  const saveAddressForUser = (addrData: {
    recipientFirstName: string;
    recipientLastName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingAddressLink?: string;
    city: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!user || !addrData.shippingAddress) return;
    try {
      const storageKey = `grass_saved_addresses_${user.id}`;
      const raw = localStorage.getItem(storageKey);
      const existing: SavedAddressOption[] = raw ? JSON.parse(raw) : [];

      const labelName = `${addrData.recipientFirstName} ${addrData.recipientLastName}`.trim();
      const label = `${labelName ? `${labelName} - ` : ''}${addrData.shippingAddress}${addrData.district ? `, ${addrData.district}` : ''} (${addrData.city || 'Jeddah'})`;

      const newOption: SavedAddressOption = {
        id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label,
        recipientFirstName: addrData.recipientFirstName,
        recipientLastName: addrData.recipientLastName,
        recipientPhone: addrData.recipientPhone,
        shippingAddress: addrData.shippingAddress,
        shippingAddressLink: addrData.shippingAddressLink || '',
        city: addrData.city || (locale === 'ar' ? 'جدة' : 'Jeddah'),
        district: addrData.district || '',
        latitude: addrData.latitude,
        longitude: addrData.longitude,
      };

      const deduped = existing.filter(
        (item) =>
          `${item.shippingAddress}_${item.recipientPhone}`.trim().toLowerCase() !==
          `${addrData.shippingAddress}_${addrData.recipientPhone}`.trim().toLowerCase()
      );

      // Prepend newest and slice to MAX 5: 5 se zyada hote hi last wala delete ho jayega
      const max5 = [newOption, ...deduped].slice(0, 5);
      localStorage.setItem(storageKey, JSON.stringify(max5));

      setLocalAddresses(max5);
    } catch {
      // Ignore errors
    }
  };

  // Delivery Scheduling
  const [deliveryDate, setDeliveryDate] = useState(saudiToday);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('');

  const handleDateChange = (newDate: string) => {
    if (newDate === deliveryDate) return;
    setDeliveryDate(newDate);
    setDeliveryTimeSlot('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.deliveryDate;
      delete next.deliveryTimeSlot;
      return next;
    });
  };

  // Gift & Card Fields
  const [senderNameOnCard, setSenderNameOnCard] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [songLink, setSongLink] = useState('');

  // Order Options & Terms
  const [promoInput, setPromoInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'credit_card' | 'stc_pay' | 'tabby' | 'tamara' | 'paypal' | 'cod'>('mada');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Auto-switch away from Tabby/Tamara if cart contains subscription items
  useEffect(() => {
    if (hasSubscription && (paymentMethod === 'tabby' || paymentMethod === 'tamara')) {
      setPaymentMethod('mada');
    }
  }, [hasSubscription, paymentMethod]);

  // Draft Order Session Persistence (reuses same order ID across switches & refreshes)
  const [draftOrderNumber, setDraftOrderNumber] = useState<string | null>(null);

  // Payment UI & Verification states
  const [showTabbyModal, setShowTabbyModal] = useState(false);
  const [hyperpayWidget, setHyperpayWidget] = useState<{
    checkoutId: string;
    scriptUrl: string;
    brands: string;
    orderNumber: string;
  } | null>(null);
  const [paymentNotification, setPaymentNotification] = useState<{
    type: 'warning' | 'error' | 'success';
    message: string;
  } | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [redirectingGateway, setRedirectingGateway] = useState<string | null>(null);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Backend queries
  const { data: serverGateways } = useGetPaymentMethodsQuery();
  const {
    data: slotsResponse,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
  } = useGetDeliverySlotsQuery(deliveryDate);
  const isSlotsPending = isSlotsLoading || isSlotsFetching;
  const rawSlots = slotsResponse?.slots;
  const serverSlots = rawSlots || [];
  const isDateBlocked = Boolean(slotsResponse?.is_blocked);
  const blockedInfo = slotsResponse?.blocked_info;
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const hasVerifiedPaymentRef = useRef(false);

  // 🔁 Detect gateway redirects / cancel / verification on page mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get('order_number') || params.get('order_id');
    const isCancelled = params.get('cancelled') === '1';
    const isFailed = params.get('failed') === '1';
    const gateway = params.get('gateway') || 'hyperpay';
    const hyperpayId = params.get('id');
    const token = params.get('token');
    const subId = params.get('subscription_id');
    const isPaymentReturn = Boolean(hyperpayId || token || subId || params.get('payment_success') === '1' || params.get('PayerID'));

    if (orderNum) {
      // 🌸 If this is a subscription order, forward immediately to the subscription checkout page
      if (orderNum.toUpperCase().startsWith('SUB-') || orderNum.toUpperCase().startsWith('SUB_')) {
        const subscribePath = locale === 'ar' ? '/subscribe-checkout' : '/en/subscribe-checkout';
        window.location.replace(`${subscribePath}${window.location.search}`);
        return;
      }
      setDraftOrderNumber(orderNum);
      sessionStorage.setItem('grass_draft_order_number', orderNum);
    } else if (isPaymentReturn) {
      const savedDraft = sessionStorage.getItem('grass_draft_order_number');
      if (savedDraft) setDraftOrderNumber(savedDraft);
    } else {
      setDraftOrderNumber(null);
      sessionStorage.removeItem('grass_draft_order_number');
    }

    try {
      const savedFormRaw = sessionStorage.getItem('grass_checkout_form_state');
      if (savedFormRaw) {
        const savedForm = JSON.parse(savedFormRaw);
        if (savedForm.senderFirstName) setSenderFirstName(savedForm.senderFirstName);
        if (savedForm.senderLastName) setSenderLastName(savedForm.senderLastName);
        if (savedForm.senderEmail) setSenderEmail(savedForm.senderEmail);
        if (savedForm.senderPhone) setSenderPhone(savedForm.senderPhone);
        if (savedForm.senderCountryCode) setSenderCountryCode(savedForm.senderCountryCode);
        if (savedForm.recipientFirstName) setRecipientFirstName(savedForm.recipientFirstName);
        if (savedForm.recipientLastName) setRecipientLastName(savedForm.recipientLastName);
        if (savedForm.recipientPhone) setRecipientPhone(savedForm.recipientPhone);
        if (savedForm.recipientCountryCode) setRecipientCountryCode(savedForm.recipientCountryCode);
        if (savedForm.shippingAddress) setShippingAddress(savedForm.shippingAddress);
        if (savedForm.shippingAddressLink) setShippingAddressLink(savedForm.shippingAddressLink);
        if (savedForm.district) setDistrict(savedForm.district);
        if (savedForm.latitude !== undefined) setLatitude(savedForm.latitude);
        if (savedForm.longitude !== undefined) setLongitude(savedForm.longitude);
        if (savedForm.deliveryDate) setDeliveryDate(savedForm.deliveryDate);
        if (savedForm.deliveryTimeSlot) setDeliveryTimeSlot(savedForm.deliveryTimeSlot);
        if (savedForm.senderNameOnCard) setSenderNameOnCard(savedForm.senderNameOnCard);
        if (savedForm.cardMessage) setCardMessage(savedForm.cardMessage);
        if (savedForm.songLink) setSongLink(savedForm.songLink);
        if (savedForm.paymentMethod) setPaymentMethod(savedForm.paymentMethod);
      }
    } catch { }

    if (isCancelled) {
      setPaymentNotification({
        type: 'warning',
        message: locale === 'ar'
          ? 'تم إلغاء عملية الدفع. سلتك محفوظة ويمكنك اختيار وسيلة دفع أخرى لإتمام الطلب.'
          : 'Payment was cancelled. Your cart has been saved and you can choose another payment method.',
      });
      return;
    }

    if (isFailed) {
      setPaymentNotification({
        type: 'error',
        message: locale === 'ar'
          ? 'فشلت عملية الدفع. يرجى التحقق من البطاقة أو اختيار وسيلة دفع بديلة.'
          : 'Payment failed. Please check your card details or select an alternative payment method.',
      });
      return;
    }

    if ((orderNum || hyperpayId || token || subId) && isPaymentReturn) {
      if (hasVerifiedPaymentRef.current) return;
      hasVerifiedPaymentRef.current = true;

      setIsVerifyingPayment(true);

      const cleanReturnUrl = () => {
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      const resourcePath = params.get('resourcePath') || undefined;
      const brand = params.get('brand') || undefined;

      verifyPayment({
        orderId: orderNum || hyperpayId || subId || token!,
        gateway,
        referenceId: hyperpayId || subId || token || undefined,
        resourcePath,
        brand,
      })
        .unwrap()
        .then((res: any) => {
          setIsVerifyingPayment(false);
          cleanReturnUrl();

          const isPaid = Boolean(res?.verification?.is_paid || res?.payment_status === 'paid');
          if (isPaid) {
            clearCartCompletely();
            sessionStorage.removeItem('grass_draft_order_number');
            sessionStorage.removeItem('grass_checkout_form_state');
            const o = res.order;
            const sFirst = o?.first_name || (o?.sender_name ? o.sender_name.split(' ')[0] : '') || senderFirstName || user?.firstName || (user?.name ? user.name.split(' ')[0] : '');
            const sLast = o?.last_name || (o?.sender_name ? o.sender_name.split(' ').slice(1).join(' ') : '') || senderLastName || user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '');
            const rName = o?.recipient_name || recipientName || `${recipientFirstName} ${recipientLastName}`.trim() || `${sFirst} ${sLast}`.trim() || 'Valued Customer';
            const rStreet = o?.address || shippingAddress || '';
            const rCity = o?.city || city || 'Jeddah';
            const rDistrict = o?.district || district || '';
            const rPhone = o?.recipient_phone || (recipientPhone ? `${recipientCountryCode}${recipientPhone.replace(/^0+/, '')}` : (o?.customer_phone || ''));

            setConfirmedOrder({
              orderNumber: res.order_number || o?.order_number || orderNum || 'ORD-COMPLETED',
              createdAt: o?.created_at || new Date().toISOString(),
              status: 'confirmed',
              items: cartItems.length > 0 ? cartItems : (o?.items || []),
              sender: {
                firstName: sFirst,
                lastName: sLast,
                phone: o?.customer_phone || (senderPhone ? `${senderCountryCode}${senderPhone}` : ''),
                email: o?.email || senderEmail || user?.email || '',
              },
              recipient: {
                type: 'gift',
                name: rName,
                firstName: recipientFirstName || (rName ? rName.split(' ')[0] : ''),
                lastName: recipientLastName || (rName ? rName.split(' ').slice(1).join(' ') : ''),
                phone: rPhone,
                city: rCity,
                district: rDistrict,
                street: rStreet,
              },
              delivery: {
                date: o?.delivery_date || deliveryDate,
                timeSlot: (o?.delivery_time || deliveryTimeSlot) as any,
              },
              paymentMethod: (o?.payment_method || gateway || 'online') as any,
              subtotal: Number(o?.subtotal || subtotal),
              vat: Number(o?.tax_amount || vat),
              shippingFee: Number(o?.shipping_amount || shippingFee),
              discount: Number(o?.discount_amount || discount),
              total: Number(res?.sar_amount || res?.total_amount || o?.total_amount || total),
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setPaymentNotification({
              type: 'error',
              message: res?.verification?.result_description || res?.verification?.message || (locale === 'ar' ? 'لم تكتمل عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.' : 'Payment was not completed. Please try again.'),
            });
          }
        })
        .catch((err: any) => {
          setIsVerifyingPayment(false);
          cleanReturnUrl();
          setPaymentNotification({
            type: 'error',
            message: err?.data?.message || (locale === 'ar' ? 'تعذر التحقق من الدفع، يرجى المحاولة لاحقاً.' : 'Could not verify payment status. Please try again.'),
          });
        });
    }
  }, []);

  // Clear slot selection if selected slot becomes unavailable or date is blocked
  useEffect(() => {
    if (isDateBlocked) {
      setDeliveryTimeSlot('');
    } else if (rawSlots && rawSlots.length > 0 && deliveryTimeSlot) {
      const isCurrentSlotValid = rawSlots.some(
        (s) => String(s.code || s.start_time || s.id) === deliveryTimeSlot && s.is_available
      );
      if (!isCurrentSlotValid) {
        setDeliveryTimeSlot('');
      }
    }
  }, [rawSlots, isDateBlocked, deliveryTimeSlot]);

  // Autosave checkout form fields to sessionStorage so inputs are preserved on gateway redirect, refresh, or back navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const formToSave = {
      senderFirstName,
      senderLastName,
      senderEmail,
      senderPhone,
      senderCountryCode,
      senderCountry,
      recipientFirstName,
      recipientLastName,
      recipientPhone,
      recipientCountryCode,
      shippingAddress,
      shippingAddressLink,
      district,
      latitude,
      longitude,
      deliveryDate,
      deliveryTimeSlot,
      senderNameOnCard,
      cardMessage,
      songLink,
      paymentMethod,
    };
    try {
      sessionStorage.setItem('grass_checkout_form_state', JSON.stringify(formToSave));
    } catch { }
  }, [
    senderFirstName,
    senderLastName,
    senderEmail,
    senderPhone,
    senderCountryCode,
    senderCountry,
    recipientFirstName,
    recipientLastName,
    recipientPhone,
    recipientCountryCode,
    shippingAddress,
    shippingAddressLink,
    district,
    latitude,
    longitude,
    deliveryDate,
    deliveryTimeSlot,
    senderNameOnCard,
    cardMessage,
    songLink,
    paymentMethod,
  ]);

  // Handle map selection
  const handleMapLocationSelect = (data: {
    address: string;
    locationLink: string;
    latitude: number;
    longitude: number;
    district?: string;
  }) => {
    setShippingAddress(data.address);
    setShippingAddressLink(data.locationLink);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    if (data.district) {
      setDistrict(data.district);
    }
  };

  // Quantity helpers
  const handleUpdateQty = (cartItemId: string, productId: string | number, newQty: number, _currentQty: number) => {
    if (newQty < 1) return;
    updateCartActionQty(productId, newQty, cartItemId);
  };

  const handleRemoveItem = (cartItemId: string, productId: string | number) => {
    removeCartActionItem(productId, cartItemId);
  };

  // Coupon helper
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim();
    if (!code) return;
    setCouponErrorMessage(null);
    try {
      const res = await applyServerCoupon({
        code,
        subtotal,
        email: senderEmail.trim() || user?.email,
      }).unwrap();
      dispatch(
        setAppliedCoupon({
          code: res.code || code,
          type: res.type,
          value: Number(res.value),
          maxDiscountAmount: Number(res.max_discount_amount || 0),
        })
      );
      setPromoInput('');
    } catch (err: any) {
      setCouponErrorMessage(
        err?.data?.message ||
        err?.data?.error ||
        (locale === 'ar' ? 'رمز القسيمة غير صالح أو منتهي الصلاحية' : 'Invalid or expired coupon code')
      );
    }
  };

  // Validate inputs
  const validateForm = () => {
    const errs: Record<string, string> = {};

    // Sender
    if (!senderFirstName.trim()) errs.senderFirstName = locale === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required';
    if (!senderLastName.trim()) errs.senderLastName = locale === 'ar' ? 'اسم العائلة مطلوب' : 'Last name is required';
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      errs.senderEmail = locale === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Valid email is required';
    }
    if (!senderPhone.trim()) errs.senderPhone = locale === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';

    // Receiver
    if (!shippingAddress.trim()) errs.shippingAddress = locale === 'ar' ? 'عنوان الشحن مطلوب' : 'Shipping address is required';
    if (!recipientFirstName.trim()) errs.recipientFirstName = locale === 'ar' ? 'اسم المستلم الأول مطلوب' : 'Recipient first name is required';
    if (!recipientLastName.trim()) errs.recipientLastName = locale === 'ar' ? 'اسم عائلة المستلم مطلوب' : 'Recipient last name is required';
    if (!recipientPhone.trim()) errs.recipientPhone = locale === 'ar' ? 'رقم هاتف المستلم مطلوب' : 'Recipient phone is required';
    if (!deliveryDate) errs.deliveryDate = locale === 'ar' ? 'تاريخ التوصيل مطلوب' : 'Delivery date is required';

    if (isDateBlocked) {
      errs.deliveryDate = locale === 'ar'
        ? 'عذراً، التوصيل غير متاح في هذا التاريخ. يرجى اختيار تاريخ آخر.'
        : 'Sorry, delivery is unavailable on this date. Please pick another date.';
    } else if (!deliveryTimeSlot || !deliveryTimeSlot.trim()) {
      errs.deliveryTimeSlot = locale === 'ar'
        ? 'يرجى اختيار وقت التوصيل للمتابعة'
        : 'Please select a delivery time slot to proceed';
    }

    if (!agreeTerms) {
      errs.agreeTerms = locale === 'ar'
        ? 'يرجى الموافقة على الشروط والأحكام للمتابعة'
        : 'Please agree to terms and conditions to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Place Order submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const hasDeliveryError = !deliveryTimeSlot || isDateBlocked;
      const customerFieldsFilled = senderFirstName.trim() && senderLastName.trim() && senderPhone.trim() && shippingAddress.trim() && recipientFirstName.trim() && recipientLastName.trim() && recipientPhone.trim();
      if (customerFieldsFilled && hasDeliveryError) {
        const deliveryEl = document.getElementById('delivery-section');
        if (deliveryEl) {
          deliveryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (isSubmittingOrder || Boolean(redirectingGateway)) {
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const recipientFullName = `${recipientFirstName} ${recipientLastName}`.trim();
      const senderFullName = `${senderFirstName} ${senderLastName}`.trim();
      const fullSenderPhone = `${senderCountryCode}${senderPhone.replace(/^0+/, '')}`;
      const fullRecipientPhone = `${recipientCountryCode}${recipientPhone.replace(/^0+/, '')}`;

      const matchedSlot = (serverSlots || []).find(
        (s) => String(s.code || s.start_time || s.id) === deliveryTimeSlot || String(s.id) === deliveryTimeSlot
      );
      const resolvedTimeSlotText = matchedSlot
        ? (locale === 'ar' ? (matchedSlot.title_ar || matchedSlot.title_en) : (matchedSlot.title_en || matchedSlot.title_ar))
        : (deliveryTimeSlot || (locale === 'ar' ? 'من 11 صباحاً وحتى 3 مساءً' : '11:00 AM to 03:00 PM'));

      const result = await createOrder({
        items: cartItems,
        orderNumber: draftOrderNumber || undefined,
        sender: {
          firstName: senderFirstName,
          lastName: senderLastName,
          country: senderCountry,
          email: senderEmail,
          phone: fullSenderPhone,
        },
        recipient: {
          type: 'gift',
          name: recipientFullName,
          firstName: recipientFirstName,
          lastName: recipientLastName,
          phone: fullRecipientPhone,
          city,
          district: district || 'Jeddah',
          street: shippingAddress,
          locationLink: shippingAddressLink,
          latitude,
          longitude,
        },
        delivery: {
          date: deliveryDate,
          timeSlot: resolvedTimeSlotText,
        },
        giftCard: {
          senderName: senderNameOnCard.trim(),
          message: cardMessage,
        },
        songLink,
        paymentMethod,
        subtotal,
        vat,
        shippingFee,
        shipping_method: activeShippingMethod?.code || 'inside_jeddah',
        shipping_amount: shippingFee,
        discount,
        total,
        couponCode: couponCode || undefined,
        currency: activeCurrency,
        exchange_rate: sarToUsdRate,
        currency_amount: activeCurrency === 'USD' ? totalUsd : total,
        sar_amount: total,
        meta_data: {
          currency: activeCurrency,
          exchange_rate: sarToUsdRate,
          sar_total: total,
          currency_total: activeCurrency === 'USD' ? totalUsd : total,
          usd_total: totalUsd,
          sar_subtotal: subtotal,
          usd_subtotal: subtotalUsd,
        },
      } as any).unwrap();

      // Persist draft order number for session reuse across payment method switches & refreshes
      if (result.orderNumber) {
        setDraftOrderNumber(result.orderNumber);
        sessionStorage.setItem('grass_draft_order_number', result.orderNumber);
      }

      if (user) {
        saveAddressForUser({
          recipientFirstName,
          recipientLastName,
          recipientPhone: fullRecipientPhone,
          shippingAddress,
          shippingAddressLink,
          city,
          district,
          latitude,
          longitude,
        });
      }

      // 🛑 If backend indicates order was ALREADY PAID, immediately show confirmation screen
      if (result.alreadyPaid || (result as any).already_paid || (result as any).payment_status === 'paid') {
        setIsSubmittingOrder(false);
        setRedirectingGateway(null);
        clearCartCompletely();
        sessionStorage.removeItem('grass_draft_order_number');
        sessionStorage.removeItem('grass_checkout_form_state');
        setConfirmedOrder(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If Cash on Delivery (COD), finalize order immediately
      if (paymentMethod === 'cod') {
        setIsSubmittingOrder(false);
        setRedirectingGateway(null);
        clearCartCompletely();
        sessionStorage.removeItem('grass_draft_order_number');
        sessionStorage.removeItem('grass_checkout_form_state');
        setConfirmedOrder(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // For online gateways (Mada, Credit Cards, STCPay, Tabby, Tamara, PayPal):
      // Initiate gateway checkout session without clearing cart until payment verified!
      let gatewayCode = paymentMethod as string;
      let brand = '';

      if (paymentMethod === 'mada') {
        gatewayCode = 'hyperpay';
        brand = 'MADA';
      } else if (paymentMethod === 'credit_card') {
        gatewayCode = 'hyperpay';
        brand = 'VISA MASTER AMEX';
      } else if (paymentMethod === 'stc_pay') {
        gatewayCode = 'hyperpay';
        brand = 'STCPAY';
      }

      const initRes = await initiatePayment({
        orderId: result.orderNumber,
        gateway: gatewayCode,
        payment_brand: brand,
      } as any).unwrap();

      // 🛑 If initiate response indicates order was already paid
      if (initRes.already_paid || (initRes as any).payment_status === 'paid') {
        setIsSubmittingOrder(false);
        setRedirectingGateway(null);
        clearCartCompletely();
        sessionStorage.removeItem('grass_draft_order_number');
        sessionStorage.removeItem('grass_checkout_form_state');
        setConfirmedOrder(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (initRes.redirect_url) {
        // Tabby, Tamara, PayPal: show redirecting state and navigate immediately
        setRedirectingGateway(paymentMethod);
        window.location.assign(initRes.redirect_url);
        return;
      }

      if (initRes.checkout_id && initRes.script_url) {
        setIsSubmittingOrder(false);
        setRedirectingGateway(null);
        // HyperPay: open interactive secure widget modal
        setHyperpayWidget({
          checkoutId: initRes.checkout_id,
          scriptUrl: initRes.script_url,
          brands: brand,
          orderNumber: result.orderNumber,
        });
        return;
      }

      setIsSubmittingOrder(false);
      setRedirectingGateway(null);
      if (initRes.success === false) {
        setPaymentNotification({
          type: 'error',
          message: initRes.message || (locale === 'ar' ? 'تعذر إنشاء جلسة الدفع، يرجى المحاولة لاحقاً.' : 'Failed to initiate payment session.'),
        });
      }
    } catch (err: any) {
      setIsSubmittingOrder(false);
      setRedirectingGateway(null);

      // If draft order has expired or was cancelled, clear draft session so next submit creates fresh order
      if (err?.data?.is_cancelled || err?.data?.message?.includes('expired') || err?.data?.message?.includes('cancelled')) {
        setDraftOrderNumber(null);
        sessionStorage.removeItem('grass_draft_order_number');
      }

      setPaymentNotification({
        type: 'error',
        message:
          err?.data?.message ||
          (locale === 'ar' ? 'تعذر إتمام الطلب، يرجى مراجعة الحقول والمحاولة مجدداً.' : 'Failed to place order. Please check fields and try again.'),
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  // Success Confirmation Screen
  if (confirmedOrder) {
    return (
      <div className="py-16 bg-[#FDFCFB] min-h-[80vh] flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#EBF3E8] text-[#546e3a] flex items-center justify-center mx-auto mb-6 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#8fae2a] block mb-1">
            {locale === 'ar' ? 'تم استلام طلبك بنجاح' : 'ORDER RECEIVED SUCCESSFULLY'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-2">
            {dict.checkout.orderSuccessTitle}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {dict.checkout.orderSuccessDesc}
          </p>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-start space-y-3 mb-8 shadow-xs">
            <div className="flex justify-between text-xs pb-3 border-b border-gray-100">
              <span className="text-gray-500">{dict.checkout.orderNumber}:</span>
              <span className="font-mono font-bold text-gray-900">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{locale === 'ar' ? 'المرسل:' : 'Sender:'}</span>
              <span className="font-semibold text-gray-900">
                {`${confirmedOrder.sender?.firstName || ''} ${confirmedOrder.sender?.lastName || ''}`.trim() ||
                  (confirmedOrder as any).sender_name ||
                  user?.name ||
                  (locale === 'ar' ? 'عميل غراس' : 'Valued Customer')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{locale === 'ar' ? 'المستلم:' : 'Recipient:'}</span>
              <span className="font-semibold text-gray-900">
                {confirmedOrder.recipient.name || (locale === 'ar' ? 'عميل غراس' : 'Valued Customer')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{dict.checkout.deliveryCity}:</span>
              <span className="font-semibold text-gray-900">
                {confirmedOrder.recipient.city}
                {confirmedOrder.recipient.street ? ` - ${confirmedOrder.recipient.street}` : ''}
              </span>
            </div>
            {Boolean(confirmedOrder.delivery?.date) && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{locale === 'ar' ? 'تاريخ التوصيل:' : 'Delivery Date:'}</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {confirmedOrder.delivery.date}
                </span>
              </div>
            )}
            {Boolean(confirmedOrder.delivery?.timeSlot) && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{locale === 'ar' ? 'وقت التوصيل:' : 'Delivery Time:'}</span>
                <span className="font-semibold text-gray-900">
                  {confirmedOrder.delivery.timeSlot}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{dict.cart.total}:</span>
              <span dir="ltr" className="font-bold text-[#546e3a] inline-flex items-center gap-1.5">
                <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency="SAR" />
                <span>{confirmedOrder.total} SAR</span>
                {sarToUsdRate > 0 && (
                  <span className="text-gray-600 font-semibold ms-1">
                    (~${(confirmedOrder.total * sarToUsdRate).toFixed(2)} USD)
                  </span>
                )}
              </span>
            </div>
          </div>

          <Link href={locale === 'ar' ? '/' : '/en'}>
            <Button variant="primary" size="lg" className="font-bold shadow-md bg-[#8fae2a] hover:bg-[#7d9b23] text-white">
              <span>{locale === 'ar' ? 'العودة إلى المتجر' : 'Continue Shopping'}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!hasMounted) {
    return <CheckoutPageSkeleton locale={locale} />;
  }

  return (
    <div className="py-6 sm:py-10 bg-[#FAFAFA] min-h-[90vh]">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* Header Breadcrumbs / Progress matching WordPress layout */}
        <div className="mb-8 text-center">
          <nav className="inline-flex items-center justify-center gap-2 sm:gap-4 text-[12px] sm:text-[13px] font-bold tracking-wider uppercase text-gray-400">
            <Link
              href={locale === 'ar' ? '/cart' : '/en/cart'}
              className="hover:text-gray-700 transition-colors"
            >
              {locale === 'ar' ? 'سلة التسوق' : 'SHOPPING CART'}
            </Link>
            <span>&rarr;</span>
            <span className="text-[#8fae2a] font-extrabold pb-0.5 border-b-2 border-[#8fae2a]">
              {locale === 'ar' ? 'إتمام الطلب' : 'CHECKOUT'}
            </span>
            <span>&rarr;</span>
            <span className="text-gray-400">
              {locale === 'ar' ? 'اكتمل الطلب' : 'ORDER COMPLETE'}
            </span>
          </nav>
        </div>



        {paymentNotification && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start justify-between gap-3 ${paymentNotification.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">{paymentNotification.message}</p>
                {draftOrderNumber && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {locale === 'ar' ? 'رقم مسودة طلبك المحفوظة:' : 'Saved Draft Order #:'}{' '}
                    <span className="font-mono font-bold">{draftOrderNumber}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPaymentNotification(null)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {cartItems.length > 0 ? (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* ============================================================== */}
            {/* LEFT COLUMN: SENDER INFORMATION & RECEIVER INFORMATION */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 space-y-8 text-start">
              {/* ---------------- 1. SENDER INFORMATION ---------------- */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                  {locale === 'ar' ? 'معلومات المرسل' : 'SENDER INFORMATION'}
                </h2>

                <div className="space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'الاسم الأول' : 'First name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={senderFirstName}
                        onChange={(e) => setSenderFirstName(e.target.value)}
                        placeholder={locale === 'ar' ? 'الاسم الأول' : 'First name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.senderFirstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.senderFirstName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.senderFirstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'اسم العائلة' : 'Last name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={senderLastName}
                        onChange={(e) => setSenderLastName(e.target.value)}
                        placeholder={locale === 'ar' ? 'اسم العائلة' : 'Last name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.senderLastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.senderLastName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.senderLastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Country / Region & Email address in 1 row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'الدولة / المنطقة' : 'Country / Region'} <span className="text-red-500">*</span>
                      </label>
                      <CountrySelect
                        value={senderCountry}
                        onChange={(val) => setSenderCountry(val)}
                        locale={locale}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.senderEmail ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.senderEmail && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.senderEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {locale === 'ar' ? 'رقم الهاتف (الواتساب)' : 'Phone number'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <CountryCodePicker
                        value={senderCountryCode}
                        onChange={(item) => setSenderCountryCode(item.dialCode)}
                        locale={locale}
                      />
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="5XXXXXXXX"
                        className={`flex-1 h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.senderPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                    </div>
                    {errors.senderPhone && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.senderPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ---------------- 2. RECEIVER INFORMATION ---------------- */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                  {locale === 'ar' ? 'معلومات المستلم' : 'RECEIVER INFORMATION'}
                </h2>

                {/* Compact Warning Notice Banner matching user design */}
                <div className="py-2.5 px-3.5 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] text-[#4A4237] flex items-center gap-3 text-xs shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                  <div className="text-[11px] sm:text-xs leading-relaxed leading-tight">
                    <strong className="font-bold text-[#1E1915]">
                      {locale === 'ar' ? 'تنبيه: ' : 'WARNING: '}
                    </strong>
                    <span>
                      {locale === 'ar'
                        ? 'إذا كان موقع المستلم يقع ضمن نطاق مواقع حساسة أو مشاريع، فقد يتعذر التوصيل وسنتواصل معك لترتيب التوصيل.'
                        : "If the recipient's location is within the range of sensitive sites, the delivery may not be possible and will contact you to arrange delivery"}
                    </span>
                  </div>
                </div>

                {/* Previously Used Address Custom Dropdown */}
                {user && savedAddresses.length > 0 && (
                  <div ref={addressDropdownRef} className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">
                        {locale === 'ar'
                          ? 'يمكنك اختيار أحد العناوين المحفوظة مسبقاً:'
                          : 'You can select one of the previously used addresses using the list below:'}
                      </label>
                      <span className="text-[10.5px] font-bold text-[#546e3a] bg-[#8fae2a]/15 px-2 py-0.5 rounded-full border border-[#8fae2a]/30">
                        {savedAddresses.length}/5
                      </span>
                    </div>

                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsAddressDropdownOpen((prev) => !prev)}
                      className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-2xs ${isAddressDropdownOpen
                          ? 'border-[#8fae2a] ring-2 ring-[#8fae2a]/20 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MapPin className="w-4 h-4 text-[#546e3a] shrink-0" />
                        <span className="truncate block text-start">
                          {savedAddresses.find((a) => a.id === selectedSavedAddress)?.label ||
                            (locale === 'ar'
                              ? 'اختر من العناوين المحفوظة...'
                              : 'Select from Addresses...')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isAddressDropdownOpen ? 'rotate-180 text-[#546e3a]' : ''
                            }`}
                        />
                      </div>
                    </button>

                    {/* Custom Dropdown Menu List */}
                    {isAddressDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden divide-y divide-gray-100 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        {/* Clear / Default Option */}
                        <div
                          onClick={() => {
                            handleSelectSavedAddress('');
                            setIsAddressDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${!selectedSavedAddress
                              ? 'bg-[#8fae2a]/10 text-[#546e3a] font-bold'
                              : 'hover:bg-gray-50 text-gray-500'
                            }`}
                        >
                          <span className="italic">
                            {locale === 'ar' ? 'اختر من العناوين المحفوظة...' : 'Select from Addresses...'}
                          </span>
                          {!selectedSavedAddress && <CheckCircle2 className="w-4 h-4 text-[#546e3a]" />}
                        </div>

                        {savedAddresses.map((addr) => {
                          const isSelected = selectedSavedAddress === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                handleSelectSavedAddress(addr.id);
                                setIsAddressDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between gap-3 group transition-colors ${isSelected
                                  ? 'bg-[#8fae2a]/10 text-gray-900 font-bold'
                                  : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <MapPin
                                  className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#546e3a]' : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                                />
                                <span className="truncate block leading-snug">
                                  {addr.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-[#546e3a]" />
                                )}
                                {/* Delete / Cross Icon Button */}
                                <button
                                  type="button"
                                  title={locale === 'ar' ? 'حذف العنوان' : 'Remove address'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSavedAddress(addr);
                                  }}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Map Section */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    {locale === 'ar' ? 'تحديد الموقع على الخريطة (جدة):' : 'Pin Address on Map (Jeddah):'}
                  </label>
                  <AddressMapPicker
                    locale={locale}
                    initialAddress={shippingAddress}
                    initialLink={shippingAddressLink}
                    onLocationSelect={handleMapLocationSelect}
                  />
                </div>

                {/* Shipping address & link inputs */}
                <div className="space-y-4 pt-2">
                  {/* Shipping address & link in 1 row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'عنوان الشحن' : 'Shipping address'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder={locale === 'ar' ? 'اسم الحي، الشارع، أو رقم المبنى' : 'District, Street, Landmark'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.shippingAddress ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.shippingAddress && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.shippingAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center justify-between">
                        <span className="truncate">{locale === 'ar' ? 'رابط موقع الشحن (خرائط جوجل)' : 'Shipping address link'}</span>
                        {shippingAddressLink && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            {locale === 'ar' ? 'تم التحديد' : 'Pinned'}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={shippingAddressLink}
                          readOnly={Boolean(shippingAddressLink)}
                          onChange={(e) => setShippingAddressLink(e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className={`w-full h-11 px-3.5 pe-9 text-xs border rounded-lg focus:outline-none transition-all ${shippingAddressLink
                            ? 'bg-gray-100/90 border-gray-200 text-gray-600 cursor-not-allowed select-all font-mono text-[11px]'
                            : 'bg-white border-gray-200 focus:border-[#8fae2a]'
                            }`}
                        />
                        {shippingAddressLink && (
                          <a
                            href={shippingAddressLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute end-3 top-3 text-[#546e3a] hover:text-[#8fae2a]"
                            title={locale === 'ar' ? 'فتح الرابط في خرائط جوجل' : 'Open in Google Maps'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 1: Recipient First Name & Recipient Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'اسم المستلم الأول' : 'Recipient first name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientFirstName}
                        onChange={(e) => setRecipientFirstName(e.target.value)}
                        placeholder={locale === 'ar' ? 'اسم المستلم الأول' : 'Recipient first name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.recipientFirstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.recipientFirstName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.recipientFirstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'اسم عائلة المستلم' : 'Recipient last name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientLastName}
                        onChange={(e) => setRecipientLastName(e.target.value)}
                        placeholder={locale === 'ar' ? 'اسم العائلة' : 'Recipient last name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.recipientLastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                          }`}
                      />
                      {errors.recipientLastName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.recipientLastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Country code & Phone number, and City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone number with Country code */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'رقم هاتف المستلم' : 'Phone number'} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <CountryCodePicker
                          value={recipientCountryCode}
                          onChange={(item) => setRecipientCountryCode(item.dialCode)}
                          locale={locale}
                        />
                        <input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="5XXXXXXXX"
                          className={`flex-1 min-w-0 h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${errors.recipientPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                            }`}
                        />
                      </div>
                      {errors.recipientPhone && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.recipientPhone}</p>
                      )}
                    </div>

                    {/* City (Fixed & Readonly to Jeddah) */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {locale === 'ar' ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        readOnly
                        className="w-full h-11 px-3.5 text-xs bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Date & Time (calculated by backend operating timezone) */}
                  <div id="delivery-section" className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200/90 space-y-5 shadow-2xs">
                    {/* Improved Delivery Date Picker */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#546e3a]" />
                          <span>{locale === 'ar' ? 'تاريخ التوصيل' : 'Delivery date'}</span>
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Quick Date Chips (Today / Tomorrow / Day After) */}
                      <div className="grid grid-cols-3 gap-2">
                        {quickDates.map((chip) => {
                          const isSelected = deliveryDate === chip.dateStr;
                          return (
                            <button
                              key={chip.dateStr}
                              type="button"
                              onClick={() => handleDateChange(chip.dateStr)}
                              className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                                ? 'border-[#8fae2a] bg-[#8fae2a]/15 text-gray-900 shadow-xs font-bold ring-2 ring-[#8fae2a]/30'
                                : 'border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                              <span className="block text-xs font-black">{chip.label}</span>
                              <span className="block text-[10.5px] text-gray-500 font-medium mt-0.5">
                                {chip.subLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Delivery Date Picker (Full-row clickable with modern popup) */}
                      <DeliveryDatePicker
                        value={deliveryDate}
                        onChange={(newDate) => handleDateChange(newDate)}
                        minDate={saudiToday}
                        locale={locale}
                        formatDisplayDate={formatDisplayDate}
                      />

                      <div className="text-[10.5px] text-gray-500 ps-1">
                        {locale === 'ar'
                          ? '• التوقيت معتمد بتوقيت المملكة العربية السعودية (مكة المكرمة GMT+3)'
                          : '• Operating on Saudi Arabia Standard Time (GMT+3)'}
                      </div>
                    </div>

                    {/* SKELETON LOADING STATE WHILE FETCHING SLOTS (Shows immediately on date change even if previous date was blocked) */}
                    {isSlotsPending ? (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#546e3a]" />
                            <span>{locale === 'ar' ? 'وقت التوصيل' : 'Delivery time'}</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#546e3a] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#546e3a] animate-ping" />
                            <span>{locale === 'ar' ? 'جاري تحديث الفترات...' : 'Updating slots...'}</span>
                          </span>
                        </div>

                        <div className="space-y-2.5 animate-pulse">
                          {[1, 2].map((i) => (
                            <div
                              key={i}
                              className="p-3.5 sm:p-4 rounded-xl border border-gray-200/90 bg-white/90 shadow-2xs flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                                <div className="w-40 h-4 bg-gray-200 rounded-md" />
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : isDateBlocked ? (
                      /* Blocked Date Alert */
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {locale === 'ar'
                              ? (blockedInfo?.title_ar || 'تنويه: المتجر مغلق في هذا اليوم')
                              : (blockedInfo?.title_en || 'Notice: Store Closed on This Date')}
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed ps-6">
                          {locale === 'ar'
                            ? (blockedInfo?.reason_ar || blockedInfo?.reason || 'نعتذر، التوصيل غير متاح في هذا اليوم. يرجى اختيار تاريخ آخر.')
                            : (blockedInfo?.reason_en || blockedInfo?.reason || 'Deliveries unavailable on this selected date. Please pick another date.')}
                        </p>
                      </div>
                    ) : (
                      /* Delivery Time Slot Section */
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#546e3a]" />
                            <span>{locale === 'ar' ? 'وقت التوصيل' : 'Delivery time'}</span>
                            <span className="text-red-500">*</span>
                          </label>
                        </div>

                        <div className="space-y-2.5">
                          {(serverSlots && serverSlots.length > 0
                            ? serverSlots.map((s) => {
                              const key = String(s.code || s.start_time || s.id);
                              const label = (
                                locale === 'ar'
                                  ? (s.title_ar || s.name_ar || s.start_time)
                                  : (s.title_en || s.name_en || s.start_time)
                              ) || 'Scheduled Delivery';
                              return {
                                code: key,
                                label: String(label),
                                isAvailable: Boolean(s.is_available),
                                cutoffReason: s.cutoff_reason,
                              };
                            })
                            : [
                              { code: 'morning', label: '11:00 am to 06:00 pm', isAvailable: true, cutoffReason: null },
                              { code: 'evening', label: '06:00 pm to 10:00 pm', isAvailable: true, cutoffReason: null },
                            ]
                          ).map((slot) => {
                            const isSelected = deliveryTimeSlot === slot.code;
                            const isAvailable = slot.isAvailable;
                            const slotLabelLower = (slot.label || '').toLowerCase();
                            const isMorning = slot.code.toLowerCase().includes('morning') || slotLabelLower.includes('11:00');
                            const isEvening = slot.code.toLowerCase().includes('evening') || slotLabelLower.includes('06:00') || slotLabelLower.includes('18:00');
                            const SlotIcon = isMorning ? Sunrise : isEvening ? Sunset : Clock;

                            return (
                              <div
                                key={slot.code}
                                onClick={() => {
                                  if (isAvailable) {
                                    setDeliveryTimeSlot(slot.code);
                                    setErrors((prev) => {
                                      const next = { ...prev };
                                      delete next.deliveryTimeSlot;
                                      return next;
                                    });
                                  }
                                }}
                                className={`p-3.5 sm:p-4 rounded-xl border text-xs transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${!isAvailable
                                  ? 'opacity-40 cursor-not-allowed bg-gray-100/70 border-gray-200 text-gray-400'
                                  : isSelected
                                    ? 'bg-[#8fae2a]/10 border-[#8fae2a] shadow-xs ring-2 ring-[#8fae2a]/30 text-gray-900'
                                    : 'bg-white hover:bg-gray-50/80 border-gray-200 hover:border-[#8fae2a]/50 text-gray-800'
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${!isAvailable
                                      ? 'bg-gray-200 text-gray-400'
                                      : isSelected
                                        ? 'bg-[#8fae2a] text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-600'
                                      }`}
                                  >
                                    <SlotIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className={`block font-extrabold text-xs sm:text-sm tracking-tight truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                      {slot.label}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  {!isAvailable && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
                                      <Lock className="w-3 h-3" />
                                      <span>{slot.cutoffReason || (locale === 'ar' ? 'انتهت فترة الحجز' : 'Closed')}</span>
                                    </span>
                                  )}

                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${!isAvailable
                                      ? 'border-gray-300 bg-gray-200'
                                      : isSelected
                                        ? 'border-[#8fae2a] bg-[#8fae2a] text-white shadow-xs'
                                        : 'border-gray-300 bg-white'
                                      }`}
                                  >
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {errors.deliveryTimeSlot && (
                          <p className="text-xs text-red-500 font-semibold pt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.deliveryTimeSlot}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ---------------- 3. GIFT CARD & DEDICATION ---------------- */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#8fae2a]" />
                    <span>{locale === 'ar' ? 'كرت الإهداء والرسالة' : 'GIFT CARD & DEDICATION'}</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                    {locale === 'ar' ? 'اختياري' : 'Optional'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Sender Name on the Gift Card */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {locale === 'ar' ? 'اسم المرسل على كرت الإهداء (اختياري)' : 'Sender name on the gift card (optional)'}
                    </label>
                    <input
                      type="text"
                      value={senderNameOnCard}
                      onChange={(e) => setSenderNameOnCard(e.target.value)}
                      placeholder={locale === 'ar' ? 'اتركه فارغاً للإرسال كمجهول' : 'Leave empty for anonymous'}
                      className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a]"
                    />
                  </div>

                  {/* Gift Message */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {locale === 'ar' ? 'رسالة الهدية (اختياري)' : 'Gift message (optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={cardMessage}
                      onChange={(e) => setCardMessage(e.target.value)}
                      placeholder={dict.product.cardMessagePlaceholder}
                      className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#8fae2a]"
                    />
                  </div>

                  {/* Song link */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <Music className="w-3.5 h-3.5 text-[#546e3a]" />
                      <span>
                        {locale === 'ar'
                          ? 'رابط أغنية للاستماع إليها وقت التوصيل (اختياري)'
                          : 'Song link to listen it at all delivery (optional)'}
                      </span>
                    </label>
                    <input
                      type="url"
                      value={songLink}
                      onChange={(e) => setSongLink(e.target.value)}
                      placeholder="https://youtube.com/... or https://spotify.com/..."
                      className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: YOUR ORDER SUMMARY & PAYMENT METHOD */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-start space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase">
                    {locale === 'ar' ? 'طلبك' : 'YOUR ORDER'}
                  </h2>
                  <Link
                    href={locale === 'ar' ? '/cart' : '/en/cart'}
                    className="text-xs font-semibold text-[#546e3a] hover:underline"
                  >
                    {locale === 'ar' ? 'تعديل السلة' : 'Edit Cart'}
                  </Link>
                </div>

                {/* Table Header: PRODUCT | SUBTOTAL */}
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                  <span>{locale === 'ar' ? 'المنتج' : 'PRODUCT'}</span>
                  <span>{locale === 'ar' ? 'المجموع' : 'SUBTOTAL'}</span>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto custom-scrollbar pe-1">
                  {cartItems.map((item) => {
                    const isRemoving = Boolean(removingItemIds?.[item.cartItemId] || removingItemIds?.[String(item.productId)]);
                    const isUpdating = Boolean(updatingItemIds?.[item.cartItemId] || updatingItemIds?.[String(item.productId)]);

                    if (isRemoving) {
                      return (
                        <div key={item.cartItemId} className="py-3 flex items-center gap-3 opacity-60 animate-pulse select-none">
                          <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-xs font-bold text-gray-400 line-through truncate block">
                              {getLocalizedProductName(item.product.name, locale)}
                            </span>
                            <span className="text-[10px] font-bold text-rose-500">
                              {locale === 'ar' ? 'جارٍ الحذف...' : 'Removing...'}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={item.cartItemId} className={`py-3 flex items-center gap-3 transition-colors ${isUpdating ? 'opacity-80' : ''}`}>
                        {/* Image */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                          <Image
                            src={formatStorageUrl(item.product.thumbnail)}
                            alt={getLocalizedProductName(item.product.name, locale)}
                            fill
                            sizes="56px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Details & Qty */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 truncate">
                            {getLocalizedProductName(item.product.name, locale)}
                          </h4>

                          {/* ⚡ Subscription Badge */}
                          {item.isSubscription && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#435849] bg-[#EBF3E8] px-2 py-0.5 rounded-md mt-1 w-fit">
                              <RotateCw className="w-3 h-3 text-[#546e3a]" />
                              <span>{locale === 'ar' ? 'اشتراك' : 'Subscription'}</span>
                            </span>
                          )}

                          {/* Addons if any (e.g. Vase, Chocolates) */}
                          {(item.addons?.vase || item.addons?.chocolates) && (
                            <div className="text-[10.5px] text-gray-500 space-y-0.5 mt-0.5">
                              {item.addons?.vase && <div>+ {item.addons.vase.name}</div>}
                              {item.addons?.chocolates && <div>+ {item.addons.chocolates.name}</div>}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Quantity display */}
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                              <span className="text-gray-500">{locale === 'ar' ? 'الكمية:' : 'Qty:'}</span>
                              <span className="font-bold text-gray-900">{item.quantity}</span>
                            </span>

                            {/* Delete X */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleRemoveItem(item.cartItemId, item.productId)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                              title={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                              aria-label={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total (both SAR & USD) */}
                        <div dir="ltr" className="text-xs font-bold text-gray-900 shrink-0 text-end">
                          {isUpdating ? (
                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse ms-auto" />
                          ) : (
                            <div className="flex items-center gap-1 justify-end">
                              <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                              <span>{item.itemTotal} SAR</span>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-500 font-medium">
                            ${(item.itemTotal * sarToUsdRate).toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ✨ Make It Perfect Add-on Trigger Banner */}
                <button
                  type="button"
                  onClick={() => setShowMakeItPerfectModal(true)}
                  className="w-full my-3 p-3 bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/5 hover:from-primary/15 hover:via-amber-500/15 hover:to-primary/10 border border-primary/20 rounded-xl flex items-center justify-between text-start transition-all duration-200 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4 text-amber-200" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{locale === 'ar' ? 'اجعلها مثالية' : 'Make it perfect'}</span>
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-md">
                          {locale === 'ar' ? 'إضافات' : 'Add-ons'}
                        </span>
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {locale === 'ar'
                          ? 'أضف شوكولاتة، كيك، أو بالونات لطلبك'
                          : 'Add chocolates, cakes, or balloons to your order'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0">
                    <span>{locale === 'ar' ? 'تعديل / إضافة' : 'Add / Browse'}</span>
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Subtotals & Taxes */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>{dict.cart.subtotal}</span>
                    <div dir="ltr" className="text-end">
                      <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                        <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                        <span>{subtotal} SAR</span>
                      </span>
                      <span className="text-[10.5px] text-gray-500 block">
                        ${subtotalUsd} USD
                      </span>
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>{dict.cart.discount}</span>
                      <div dir="ltr" className="text-end">
                        <span className="flex items-center justify-end gap-1">
                          <span>-</span>
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{discount} SAR</span>
                        </span>
                        <span className="text-[10.5px] text-emerald-500 font-normal block">
                          -${discountUsd} USD
                        </span>
                      </div>
                    </div>
                  )}

                  {isShippingReady && (
                    <div className="flex justify-between items-center">
                      <span>
                        {activeShippingMethod
                          ? (locale === 'ar'
                            ? (activeShippingMethod.name_ar || activeShippingMethod.name)
                            : (activeShippingMethod.name_en || activeShippingMethod.name))
                          : (locale === 'ar' ? 'التوصيل داخل جدة' : 'Delivery Inside Jeddah')}
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {shippingFee === 0 ? (
                          locale === 'ar' ? 'توصيل مجاني' : 'Free Delivery'
                        ) : (
                          <div dir="ltr" className="text-end">
                            <span className="flex items-center justify-end gap-1 text-gray-900">
                              <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                              <span>{shippingFee} SAR</span>
                            </span>
                            <span className="text-[10.5px] text-gray-500 font-normal block">
                              ${shippingFeeUsd} USD
                            </span>
                          </div>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>
                      {locale === 'ar'
                        ? `ضريبة القيمة المضافة (${vatPercentage}%)${isVatIncluded ? ' (مشمولة بالأسعار)' : ''}`
                        : `Saudi Arabia VAT (${vatPercentage}%)${isVatIncluded ? ' (Included in prices)' : ''}`}
                    </span>
                    <div dir="ltr" className="text-end">
                      <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                        <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                        <span>{Number(vat).toFixed(2)} SAR</span>
                      </span>
                      <span className="text-[10.5px] text-gray-500 block">
                        ${vatUsd} USD
                      </span>
                    </div>
                  </div>

                  {/* Total in SAR & USD (Both clearly displayed) */}
                  <div className="pt-3 border-t border-gray-200 space-y-1.5">
                    <div className="flex justify-between items-baseline text-base font-black text-gray-900">
                      <span>{dict.cart.total} (SAR)</span>
                      <span dir="ltr" className="text-[#8fae2a] flex items-center gap-1 text-lg">
                        <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                        <span>{Number(total).toFixed(2)} SAR</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span>{locale === 'ar' ? 'المجموع المقابل بالدولار الأمريكي:' : 'Equivalent in US Dollar:'}</span>
                      <span dir="ltr" className="text-[#a2c03e] font-extrabold text-sm">
                        ${totalUsd} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Coupon Box */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      disabled={isApplyingCoupon}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (couponErrorMessage) setCouponErrorMessage(null);
                      }}
                      placeholder={locale === 'ar' ? 'رمز القسيمة' : 'Enter promo code'}
                      className="flex-1 h-10 px-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a] uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    />
                    <button
                      type="button"
                      disabled={isApplyingCoupon || !promoInput.trim()}
                      onClick={handleApplyCoupon}
                      className="px-4 h-10 bg-[#8fae2a] text-white text-xs font-bold rounded-lg hover:bg-[#7d9b23] transition-all uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 min-w-[120px]"
                    >
                      {isApplyingCoupon && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                      <span>
                        {isApplyingCoupon
                          ? (locale === 'ar' ? 'جاري التحقق...' : 'Checking...')
                          : (locale === 'ar' ? 'تطبيق الكوبون' : 'APPLY COUPON')}
                      </span>
                    </button>
                  </div>
                  {couponErrorMessage && (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                      <span>{couponErrorMessage}</span>
                    </p>
                  )}
                  {couponCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg mt-2">
                      <span>✓ {couponCode} {locale === 'ar' ? 'مطبق' : 'applied'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeCoupon());
                          setCouponErrorMessage(null);
                        }}
                        className="text-red-500 hover:underline font-bold"
                      >
                        {dict.cart.remove}
                      </button>
                    </div>
                  )}
                </div>

                {/* Security and Payment Gateways Logo Banner */}
                <div className="pt-3 border-t border-gray-100 text-center space-y-2">
                  <p className="text-[11px] text-gray-400">
                    {locale === 'ar' ? 'جميع المعاملات تتم بأمان وحماية مشفرة' : 'All transactions are processed in a secure environment.'}
                  </p>

                </div>

                {/* Payment Options Radio List matching screenshot */}
                <div className="space-y-3 pt-2">
                  {/* 1. Mada Debit Card */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'mada'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'mada'}
                        onChange={() => setPaymentMethod('mada')}
                        className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                      />
                      <span>{locale === 'ar' ? 'بطاقة مدى البنكية' : 'mada debit card'}</span>
                    </div>
                    <img
                      src="/payments/mada-logo.svg"
                      alt="mada"
                      width={60}
                      height={20}
                      className="w-[60px] h-[20px] aspect-[3/1] object-contain shrink-0"
                    />
                  </label>

                  {/* 2. Credit Cards Payment */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'credit_card'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                      />
                      <span>{locale === 'ar' ? 'البطاقات الائتمانية' : 'Credit Cards Payment'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <img src="/payments/visa.svg" alt="Visa" width={46} height={20} className="h-[20px] w-auto max-w-[46px] object-contain" />
                      <img src="/payments/mastercard.svg" alt="Mastercard" width={46} height={20} className="h-[20px] w-auto max-w-[46px] object-contain" />
                      <img src="/payments/amex.svg" alt="Amex" width={46} height={20} className="h-[20px] w-auto max-w-[46px] object-contain" />
                    </div>
                  </label>

                  {/* 3. STCPay */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'stc_pay'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'stc_pay'}
                        onChange={() => setPaymentMethod('stc_pay')}
                        className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                      />
                      <span>{locale === 'ar' ? 'اس تي سي باي' : 'STCPay'}</span>
                    </div>
                    <img
                      src="/payments/stcpay.svg"
                      alt="STCPay"
                      width={60}
                      height={20}
                      className="w-[60px] h-[20px] object-contain shrink-0"
                    />
                  </label>

                  {/* 4. Pay later with Tabby (Hidden for subscriptions) */}
                  {!hasSubscription && (
                    <div>
                      <label
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'tabby'
                          ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={paymentMethod === 'tabby'}
                            onChange={() => setPaymentMethod('tabby')}
                            className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                          />
                          <span>{locale === 'ar' ? 'الدفع لاحقاً عبر تابي' : 'Pay later with Tabby'}</span>
                        </div>
                        <img
                          src="/payments/tabby.svg"
                          alt="Tabby"
                          width={60}
                          height={20}
                          className="w-[60px] h-[20px] object-contain shrink-0"
                        />
                      </label>

                      {/* Expandable Tabby Installment Box */}
                      {paymentMethod === 'tabby' && (
                        <div className="mt-2.5 p-4 bg-white border border-gray-200/90 rounded-xl shadow-xs text-start animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="space-y-1">
                              <span className="text-[11px] text-gray-500 font-medium block">
                                {locale === 'ar' ? 'بدءاً من' : 'As low as'}
                              </span>
                              <div dir="ltr" className="text-lg font-black text-gray-900 flex items-center gap-1">
                                <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                                <span>{(total / 4).toFixed(2)}/mo</span>
                              </div>
                              <span className="text-xs text-gray-500 block">
                                {locale === 'ar' ? '4 دفعات شهرية ميسرة' : '4 monthly payments'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowTabbyModal(true)}
                                className="mt-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors cursor-pointer inline-block"
                              >
                                {locale === 'ar' ? 'عرض الخيارات' : 'View options'}
                              </button>
                            </div>

                            <div className="space-y-2 text-xs text-gray-700 border-t sm:border-t-0 sm:border-s border-gray-100 pt-3 sm:pt-0 sm:ps-4">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs shrink-0">✨</span>
                                <span className="font-medium">{locale === 'ar' ? 'بدون رسوم تأخير' : 'No late fees'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs shrink-0">🌙</span>
                                <span className="font-medium">{locale === 'ar' ? 'متوافق مع الشريعة' : 'Shariah compliant'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs shrink-0">🛡️</span>
                                <span className="font-medium">{locale === 'ar' ? 'حماية المشتري' : 'Buyer protection'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Tamara (Hidden for subscriptions) */}
                  {!hasSubscription && (
                    <label
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'tamara'
                        ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={paymentMethod === 'tamara'}
                          onChange={() => setPaymentMethod('tamara')}
                          className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                        />
                        <span>{locale === 'ar' ? 'تمارا' : 'Tamara'}</span>
                      </div>
                      <img
                        src="/payments/tamara.svg"
                        alt="Tamara"
                        width={60}
                        height={20}
                        className="w-[60px] h-[20px] object-contain shrink-0"
                      />
                    </label>
                  )}

                  {/* 6. PayPal Express */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'paypal'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                      />
                      <span>{locale === 'ar' ? 'باي بال إكسبريس' : 'PayPal Express'}</span>
                    </div>
                    <img
                      src="/payments/paypal.svg"
                      alt="PayPal"
                      width={60}
                      height={20}
                      className="w-[60px] h-[20px] object-contain shrink-0"
                    />
                  </label>

                  {/* 7. Cash on Delivery (COD) */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                      />
                      <span>{locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery (COD)'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">COD</span>
                  </label>
                </div>

                {/* Privacy Policy disclaimer */}
                <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
                  {locale === 'ar'
                    ? 'سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك في هذا الموقع، ولأغراض أخرى موضحة في سياسة الخصوصية الخاصة بنا.'
                    : 'Your personal data will be used to process your order, to support your experience throughout this website, and for other purposes described in our privacy policy.'}
                </p>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (e.target.checked) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.agreeTerms;
                            return next;
                          });
                        }
                      }}
                      className="mt-0.5 w-4 h-4 text-[#8fae2a] rounded border-gray-300 focus:ring-[#8fae2a]"
                    />
                    <span className="leading-snug select-none">
                      {locale === 'ar' ? (
                        <>
                          <span>لقد قرأت ووافقت على </span>
                          <Link
                            href="/terms-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#546e3a] underline underline-offset-2 hover:text-[#3d5128]"
                          >
                            الشروط والأحكام الخاصة بالموقع
                          </Link>
                        </>
                      ) : (
                        <>
                          <span>I have read and agree to the website </span>
                          <Link
                            href="/en/terms-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#546e3a] underline underline-offset-2 hover:text-[#3d5128]"
                          >
                            terms and conditions
                          </Link>
                        </>
                      )}
                      <span className="text-red-500 font-bold ms-1">*</span>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.agreeTerms}</p>
                  )}
                </div>

                {/* Big Place Order Button matching WordPress style */}
                <button
                  type="submit"
                  disabled={isLoading || isSubmittingOrder || Boolean(redirectingGateway) || isDateBlocked || isSlotsPending}
                  className={`w-full py-3.5 px-6 rounded-lg text-sm font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${isLoading || isSubmittingOrder || Boolean(redirectingGateway) || isDateBlocked || isSlotsPending
                    ? 'bg-gray-400 cursor-not-allowed opacity-75'
                    : 'bg-[#8fae2a] hover:bg-[#7d9b23] active:scale-[0.99]'
                    }`}
                >
                  {(isLoading || isSubmittingOrder || redirectingGateway) ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>
                        {redirectingGateway
                          ? (locale === 'ar' ? 'جارٍ التحويل إلى بوابة الدفع...' : 'REDIRECTING TO PAYMENT...')
                          : (locale === 'ar' ? 'جارٍ إتمام الطلب...' : 'PROCESSING ORDER...')}
                      </span>
                    </>
                  ) : isSlotsPending ? (
                    locale === 'ar' ? 'جاري تحديث الفترات...' : 'UPDATING SLOTS...'
                  ) : isDateBlocked ? (
                    locale === 'ar' ? 'التوصيل غير متاح في هذا التاريخ' : 'DELIVERY UNAVAILABLE ON THIS DATE'
                  ) : (
                    locale === 'ar' ? 'إتمام الطلب' : 'PLACE ORDER'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-20 text-center bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {dict.cart.emptyTitle}
            </h3>
            <Link href={locale === 'ar' ? '/products' : '/en/products'}>
              <Button variant="primary" size="md" className="bg-[#8fae2a] hover:bg-[#7d9b23] text-white">
                <span>{dict.cart.continueShopping}</span>
              </Button>
            </Link>
          </div>
        )}

        {/* HyperPay Secure Card Widget Modal */}
        {hyperpayWidget && (
          <HyperPayWidgetModal
            isOpen={Boolean(hyperpayWidget)}
            onClose={() => setHyperpayWidget(null)}
            checkoutId={hyperpayWidget.checkoutId}
            scriptUrl={hyperpayWidget.scriptUrl}
            brands={hyperpayWidget.brands}
            orderNumber={hyperpayWidget.orderNumber}
            amount={activeCurrency === 'USD' ? totalUsd : total}
            sarAmount={total}
            currency={activeCurrency}
            locale={locale}
          />
        )}

        {/* Tabby 4 Installments Info Breakdown Modal */}
        <TabbyInstallmentModal
          isOpen={showTabbyModal}
          onClose={() => setShowTabbyModal(false)}
          totalAmount={activeCurrency === 'USD' ? totalUsd : total}
          currency={activeCurrency}
          locale={locale}
        />

        {/* 🌟 Make It Perfect Upsell Add-ons Modal */}
        <MakeItPerfectModal
          isOpen={showMakeItPerfectModal}
          onClose={() => {
            setShowMakeItPerfectModal(false);
            try {
              sessionStorage.setItem('seen_checkout_make_it_perfect', '1');
            } catch {}
          }}
          locale={locale}
        />

        {/* Smooth Processing & Payment Redirection Overlay */}
        {(isSubmittingOrder || Boolean(redirectingGateway)) && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-[#8fae2a]/15 text-[#546e3a] flex items-center justify-center mx-auto mb-4 ring-8 ring-[#8fae2a]/10">
                <svg
                  className="animate-spin h-8 w-8 text-[#546e3a]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>

              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">
                {redirectingGateway === 'paypal'
                  ? (locale === 'ar' ? 'جارٍ تحويلك إلى PayPal...' : 'Redirecting to PayPal...')
                  : redirectingGateway === 'tabby'
                    ? (locale === 'ar' ? 'جارٍ تحويلك إلى تابي (Tabby)...' : 'Redirecting to Tabby...')
                    : redirectingGateway === 'tamara'
                      ? (locale === 'ar' ? 'جارٍ تحويلك إلى تمارا (Tamara)...' : 'Redirecting to Tamara...')
                      : redirectingGateway
                        ? (locale === 'ar' ? 'جارٍ تحويلك إلى بوابة الدفع...' : 'Redirecting to Payment Gateway...')
                        : (locale === 'ar' ? 'جارٍ معالجة وتأكيد طلبك...' : 'Processing Your Order...')}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed">
                {locale === 'ar'
                  ? 'يرجى الانتظار بضع ثوانٍ، لا تقم بإغلاق الصفحة أو تحديثها لضمان إتمام العملية بنجاح.'
                  : 'Please wait a moment, do not refresh or close this page to ensure your order completes securely.'}
              </p>

              <div className="mt-5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#8fae2a] h-full rounded-full animate-[pulse_1s_infinite] w-full" />
              </div>
            </div>
          </div>
        )}

        {/* 💳 Fullscreen Payment Verification Overlay (Blocks form interactions during gateway callback) */}
        {isVerifyingPayment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-500/10">
                <ShieldCheck className="w-10 h-10 animate-pulse text-[#546e3a]" />
              </div>

              {(draftOrderNumber || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('order_number'))) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-[11px] font-mono font-bold text-gray-700 mb-3">
                  <span>{locale === 'ar' ? 'طلب رقم:' : 'Order:'}</span>
                  <span className="text-[#546e3a]">
                    {draftOrderNumber || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('order_number') : '')}
                  </span>
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                {locale === 'ar'
                  ? 'جارٍ التحقق من حالة الدفع وتأكيد طلبك...'
                  : 'Verifying Payment & Confirming Order...'}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {locale === 'ar'
                  ? 'يرجى الانتظار بضع ثوانٍ بينما نتحقق من استلام الدفعة من بوابة الدفع وتأكيد طلبك. لا تقم بإغلاق الصفحة.'
                  : 'Please wait a moment while we securely verify your transaction with the payment gateway and confirm your order. Do not close this page.'}
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#546e3a]">
                <div className="w-3.5 h-3.5 border-2 border-[#546e3a] border-t-transparent rounded-full animate-spin" />
                <span>{locale === 'ar' ? 'تأكيد آمن ومشفر 256-Bit SSL' : '256-Bit SSL Encrypted Verification'}</span>
              </div>

              <div className="mt-5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#8fae2a] h-full rounded-full animate-[pulse_1s_infinite] w-full" />
              </div>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
