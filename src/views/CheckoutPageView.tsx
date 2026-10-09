'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearCart,
  removeItem,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  selectCartTotals,
} from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { useGetUserOrdersQuery, useGetUserProfileQuery } from '@/store/api/authApi';
import {
  useGetPaymentMethodsQuery,
  useGetDeliverySlotsQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import {
  useRemoveCartItemMutation,
  useUpdateCartQuantityMutation,
  getLocalizedProductName,
} from '@/store/api/cartApi';
import { formatPrice } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
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
} from 'lucide-react';

import { CountryCodePicker, ALL_COUNTRY_CODES } from '@/components/checkout/CountryCodePicker';
import { DeliveryDatePicker } from '@/components/checkout/DeliveryDatePicker';
import { CountrySelect } from '@/components/common/CountrySelect';
import { HyperPayWidgetModal } from '@/components/checkout/HyperPayWidgetModal';
import { TabbyInstallmentModal } from '@/components/checkout/TabbyInstallmentModal';

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
  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const { subtotal, discount, shippingFee } = useAppSelector(selectCartTotals);
  const user = useAppSelector((state) => state.auth.user);

  // Dynamic VAT percentage and currency conversion from Global Settings
  const { data: globalSettings } = useGetGlobalSettingsQuery();
  const { currency: activeCurrency, isUSD, sarToUsdRate } = useCurrency(locale);
  const vatPercentage = Number(globalSettings?.tax?.vat_percentage ?? 15);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = Math.round(discountedSubtotal * (vatPercentage / 100));
  const total = discountedSubtotal + shippingFee;

  // Real-time USD conversions
  const subtotalUsd = Number((subtotal * sarToUsdRate).toFixed(2));
  const discountUsd = Number((discount * sarToUsdRate).toFixed(2));
  const shippingFeeUsd = Number((shippingFee * sarToUsdRate).toFixed(2));
  const vatUsd = Number((vat * sarToUsdRate).toFixed(2));
  const totalUsd = Number((total * sarToUsdRate).toFixed(2));

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [removeServerCartItem] = useRemoveCartItemMutation();
  const [updateServerCartQuantity] = useUpdateCartQuantityMutation();
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

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
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');
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

  // Queries for user's past orders and profile
  const userId = user?.id;
  const { data: userOrders } = useGetUserOrdersQuery(userId, {
    skip: !userId,
  });
  const { data: profileUser } = useGetUserProfileQuery(undefined, {
    skip: !userId,
  });

  // Load localStorage saved addresses once when userId changes
  useEffect(() => {
    if (!userId) {
      setLocalAddresses([]);
      return;
    }
    try {
      const storageKey = `grass_saved_addresses_${userId}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: SavedAddressOption[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocalAddresses(parsed);
        }
      }
    } catch {
      // Ignore JSON errors
    }
  }, [userId]);

  // Purely computed saved addresses: ZERO setState inside an effect, eliminates infinite loop
  const savedAddresses = useMemo<SavedAddressOption[]>(() => {
    if (!user) return [];

    const list: SavedAddressOption[] = [];
    const seenKeys = new Set<string>();

    // 1. From LocalStorage
    localAddresses.forEach((addr) => {
      const key = `${addr.shippingAddress || ''}_${addr.recipientPhone || ''}`.trim().toLowerCase();
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        list.push(addr);
      }
    });

    // 2. From User Past Orders
    if (Array.isArray(userOrders) && userOrders.length > 0) {
      userOrders.forEach((order, idx) => {
        const rec = order.recipient;
        if (rec && (rec.street || rec.city)) {
          const street = rec.street || '';
          const phone = rec.phone || '';
          const key = `${street}_${phone}`.trim().toLowerCase();
          if (key && !seenKeys.has(key)) {
            seenKeys.add(key);
            const nameParts = (rec.name || '').trim().split(' ');
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';
            list.push({
              id: `order_${order.orderNumber || idx}`,
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
      });
    }

    // 3. From User Profile
    const activeProfile = profileUser || user;
    if (activeProfile && (activeProfile.street || activeProfile.city)) {
      const street = activeProfile.street || '';
      const phone = activeProfile.phone || '';
      const key = `${street}_${phone}`.trim().toLowerCase();
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        const nameParts = (activeProfile.name || '').trim().split(' ');
        list.unshift({
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

    return list;
  }, [user, localAddresses, userOrders, profileUser, locale]);

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

  // Helper to persist address into user saved list
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

      deduped.unshift(newOption);
      localStorage.setItem(storageKey, JSON.stringify(deduped));

      setLocalAddresses(deduped);
    } catch {
      // Ignore errors
    }
  };

  // Delivery Scheduling
  const [deliveryDate, setDeliveryDate] = useState(saudiToday);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('afternoon');

  // Gift & Card Fields
  const [senderNameOnCard, setSenderNameOnCard] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [songLink, setSongLink] = useState('');

  // Order Options & Terms
  const [promoInput, setPromoInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'credit_card' | 'stc_pay' | 'tabby' | 'tamara' | 'paypal' | 'cod'>('mada');
  const [agreeTerms, setAgreeTerms] = useState(true);

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

  // 🔁 Detect gateway redirects / cancel / verification on page mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get('order_number') || params.get('order_id');
    const isCancelled = params.get('cancelled') === '1';
    const isFailed = params.get('failed') === '1';
    const gateway = params.get('gateway') || 'hyperpay';
    const hyperpayId = params.get('id');

    if (orderNum) {
      setDraftOrderNumber(orderNum);
      sessionStorage.setItem('grass_draft_order_number', orderNum);
    } else {
      const savedDraft = sessionStorage.getItem('grass_draft_order_number');
      if (savedDraft) setDraftOrderNumber(savedDraft);
    }

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

    if (orderNum || hyperpayId) {
      setIsVerifyingPayment(true);
      verifyPayment({
        orderId: orderNum || hyperpayId!,
        gateway,
        referenceId: hyperpayId || undefined,
      })
        .unwrap()
        .then((res: any) => {
          setIsVerifyingPayment(false);
          const isPaid = Boolean(res?.verification?.is_paid || res?.payment_status === 'paid');
          if (isPaid) {
            dispatch(clearCart());
            sessionStorage.removeItem('grass_draft_order_number');
            setConfirmedOrder({
              orderNumber: res.order_number || orderNum || 'ORD-COMPLETED',
              createdAt: new Date().toISOString(),
              status: 'confirmed',
              items: cartItems,
              recipient: {
                type: 'gift',
                name: (recipientName || `${recipientFirstName} ${recipientLastName}`.trim()) || 'Valued Customer',
                firstName: recipientFirstName,
                lastName: recipientLastName,
                phone: `${recipientCountryCode}${recipientPhone.replace(/^0+/, '')}`,
                city,
                district,
                street: shippingAddress,
              },
              delivery: {
                date: deliveryDate,
                timeSlot: deliveryTimeSlot as any,
              },
              paymentMethod: (gateway as any) || 'online',
              subtotal,
              vat,
              shippingFee,
              discount,
              total: res?.verification?.amount || total,
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setPaymentNotification({
              type: 'error',
              message: res?.verification?.result_description || (locale === 'ar' ? 'لم تكتمل عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.' : 'Payment was not completed. Please try again.'),
            });
          }
        })
        .catch((err: any) => {
          setIsVerifyingPayment(false);
          setPaymentNotification({
            type: 'error',
            message: err?.data?.message || (locale === 'ar' ? 'تعذر التحقق من الدفع، يرجى المحاولة لاحقاً.' : 'Could not verify payment status. Please try again.'),
          });
        });
    }
  }, []);

  // Ensure a valid slot is selected when slots data loads or changes
  useEffect(() => {
    if (rawSlots && rawSlots.length > 0) {
      const isCurrentSlotValid = rawSlots.some(
        (s) => String(s.code || s.start_time || s.id) === deliveryTimeSlot && s.is_available
      );
      if (!isCurrentSlotValid) {
        const firstAvailable = rawSlots.find((s) => s.is_available);
        if (firstAvailable) {
          setDeliveryTimeSlot(String(firstAvailable.code || firstAvailable.start_time || firstAvailable.id));
        }
      }
    }
  }, [rawSlots]);

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
  const handleUpdateQty = (cartItemId: string, productId: string | number, newQty: number, currentQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId, productId);
      return;
    }
    dispatch(updateQuantity({ cartItemId, quantity: newQty }));
    const quantityChange: 1 | -1 = newQty > currentQty ? 1 : -1;
    updateServerCartQuantity({ productId, quantityChange }).unwrap().catch(() => { });
  };

  const handleRemoveItem = (cartItemId: string, productId: string | number) => {
    dispatch(removeItem(cartItemId));
    removeServerCartItem({ productId }).unwrap().catch(() => { });
  };

  // Coupon helper
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    dispatch(applyCoupon(promoInput.trim()));
    setPromoInput('');
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
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    try {
      const recipientFullName = `${recipientFirstName} ${recipientLastName}`.trim();
      const senderFullName = `${senderFirstName} ${senderLastName}`.trim();
      const fullSenderPhone = `${senderCountryCode}${senderPhone.replace(/^0+/, '')}`;
      const fullRecipientPhone = `${recipientCountryCode}${recipientPhone.replace(/^0+/, '')}`;

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
          timeSlot: deliveryTimeSlot,
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

      // If Cash on Delivery (COD), finalize order immediately
      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        sessionStorage.removeItem('grass_draft_order_number');
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

      if (initRes.redirect_url) {
        // Tabby, Tamara, PayPal: redirect to gateway checkout page
        window.location.href = initRes.redirect_url;
        return;
      }

      if (initRes.checkout_id && initRes.script_url) {
        // HyperPay: open interactive secure widget modal
        setHyperpayWidget({
          checkoutId: initRes.checkout_id,
          scriptUrl: initRes.script_url,
          brands: brand,
          orderNumber: result.orderNumber,
        });
        return;
      }

      if (initRes.success === false) {
        setPaymentNotification({
          type: 'error',
          message: initRes.message || (locale === 'ar' ? 'تعذر إنشاء جلسة الدفع، يرجى المحاولة لاحقاً.' : 'Failed to initiate payment session.'),
        });
      }
    } catch (err: any) {
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
                {confirmedOrder.sender?.firstName} {confirmedOrder.sender?.lastName}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{locale === 'ar' ? 'المستلم:' : 'Recipient:'}</span>
              <span className="font-semibold text-gray-900">{confirmedOrder.recipient.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{dict.checkout.deliveryCity}:</span>
              <span className="font-semibold text-gray-900">
                {confirmedOrder.recipient.city} - {confirmedOrder.recipient.street}
              </span>
            </div>
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

        {/* Payment Verification / Notification Banners */}
        {isVerifyingPayment && (
          <div className="mb-6 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-900 flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs font-bold">
              {locale === 'ar' ? 'جارٍ التحقق من حالة الدفع وتأكيد طلبك...' : 'Verifying payment status and confirming your order...'}
            </span>
          </div>
        )}

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

                {/* Previously Used Address Select Dropdown */}
                {user && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {locale === 'ar'
                        ? 'يمكنك اختيار أحد العناوين المحفوظة مسبقاً:'
                        : 'You can select one of the previously used addresses using the list below:'}
                    </label>
                    <select
                      value={selectedSavedAddress}
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                      className="w-full h-11 px-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a] text-gray-700 font-medium"
                    >
                      <option value="">
                        {locale === 'ar' ? 'اختر من العناوين المحفوظة...' : 'Select from Addresses...'}
                      </option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label}
                        </option>
                      ))}
                    </select>
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
                  <div className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200/90 space-y-5 shadow-2xs">
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
                              onClick={() => setDeliveryDate(chip.dateStr)}
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
                        onChange={(newDate) => setDeliveryDate(newDate)}
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

                    {/* Blocked Date Alert */}
                    {isDateBlocked && (
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
                    )}

                    {/* Delivery Time Slot Section - only show when date is not full-day blocked */}
                    {!isDateBlocked && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#546e3a]" />
                            <span>{locale === 'ar' ? 'وقت التوصيل' : 'Delivery time'}</span>
                            <span className="text-red-500">*</span>
                          </label>
                          {isSlotsPending && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#546e3a] animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#546e3a] animate-ping" />
                              <span>{locale === 'ar' ? 'جاري تحديث الفترات...' : 'Updating slots...'}</span>
                            </span>
                          )}
                        </div>

                        {/* SKELETON LOADING STATE WHILE FETCHING NEW DATE SLOTS */}
                        {isSlotsPending ? (
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
                        ) : (
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
                <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                  {locale === 'ar' ? 'طلبك' : 'YOUR ORDER'}
                </h2>

                {/* Table Header: PRODUCT | SUBTOTAL */}
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                  <span>{locale === 'ar' ? 'المنتج' : 'PRODUCT'}</span>
                  <span>{locale === 'ar' ? 'المجموع' : 'SUBTOTAL'}</span>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pe-1">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="py-3 flex items-center gap-3">
                      {/* Image */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                        <Image
                          src={formatStorageUrl(item.product.thumbnail)}
                          alt={getLocalizedProductName(item.product.name, locale)}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details & Qty */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">
                          {getLocalizedProductName(item.product.name, locale)}
                        </h4>

                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Qty changer */}
                          <div className="inline-flex items-center border border-gray-200 rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.cartItemId, item.productId, item.quantity - 1, item.quantity)}
                              className="px-1.5 py-0.5 text-gray-500 hover:text-black hover:bg-gray-100 text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.cartItemId, item.productId, item.quantity + 1, item.quantity)}
                              className="px-1.5 py-0.5 text-gray-500 hover:text-black hover:bg-gray-100 text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete X */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.cartItemId, item.productId)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total (both SAR & USD) */}
                      <div dir="ltr" className="text-xs font-bold text-gray-900 shrink-0 text-end">
                        <div className="flex items-center gap-1 justify-end">
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{item.itemTotal} SAR</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          ${(item.itemTotal * sarToUsdRate).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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

                  <div className="flex justify-between items-center">
                    <span>{locale === 'ar' ? 'الشحن' : 'Shipment'}</span>
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

                  <div className="flex justify-between items-center">
                    <span>
                      {locale === 'ar'
                        ? `ضريبة القيمة المضافة (${vatPercentage}%)`
                        : `Saudi Arabia VAT (${vatPercentage}%)`}
                    </span>
                    <div dir="ltr" className="text-end">
                      <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                        <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                        <span>{vat} SAR</span>
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
                        <span>{total} SAR</span>
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
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={locale === 'ar' ? 'رمز القسيمة' : 'Enter promo code'}
                      className="flex-1 h-10 px-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 h-10 bg-[#8fae2a] text-white text-xs font-bold rounded-lg hover:bg-[#7d9b23] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      {locale === 'ar' ? 'تطبيق الكوبون' : 'APPLY COUPON'}
                    </button>
                  </div>
                  {couponCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg mt-2">
                      <span>✓ {couponCode} {locale === 'ar' ? 'مطبق' : 'applied'}</span>
                      <button
                        type="button"
                        onClick={() => dispatch(removeCoupon())}
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
                    <img src="/payments/mada-logo.svg" alt="mada" className="h-4 object-contain shrink-0" />
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
                      <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                      <img src="/payments/mastercard.svg" alt="Mastercard" className="h-4 object-contain" />
                      <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />
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
                    <img src="/payments/stcpay.svg" alt="STCPay" className="h-4.5 object-contain shrink-0" />
                  </label>

                  {/* 4. Pay later with Tabby */}
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
                      <img src="/payments/tabby.svg" alt="Tabby" className="h-5.5 object-contain shrink-0" />
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

                  {/* 5. Tamara */}
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
                    <img src="/payments/tamara.svg" alt="Tamara" className="h-5.5 object-contain shrink-0" />
                  </label>

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
                    <img src="/payments/paypal.svg" alt="PayPal" className="h-4.5 object-contain shrink-0" />
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
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#8fae2a] rounded border-gray-300 focus:ring-[#8fae2a]"
                    />
                    <span className="leading-snug">
                      {locale === 'ar'
                        ? 'لقد قرأت ووافقت على الشروط والأحكام الخاصة بالموقع '
                        : 'I have read and agree to the website terms and conditions '}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.agreeTerms}</p>
                  )}
                </div>

                {/* Big Place Order Button matching WordPress style */}
                <button
                  type="submit"
                  disabled={isLoading || isDateBlocked}
                  className={`w-full py-3.5 px-6 rounded-lg text-sm font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer ${isLoading || isDateBlocked
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-[#8fae2a] hover:bg-[#7d9b23] active:scale-[0.99]'
                    }`}
                >
                  {isLoading
                    ? (locale === 'ar' ? 'جارٍ إتمام الطلب...' : 'PROCESSING ORDER...')
                    : isDateBlocked
                      ? (locale === 'ar' ? 'التوصيل غير متاح في هذا التاريخ' : 'DELIVERY UNAVAILABLE ON THIS DATE')
                      : (locale === 'ar' ? 'إتمام الطلب' : 'PLACE ORDER')}
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
      </div>
    </div>
  );
}
