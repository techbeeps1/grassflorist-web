'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { useAppSelector } from '@/store';
import { useGetUserOrdersQuery, useGetUserProfileQuery } from '@/store/api/authApi';
import { useCheckoutSubscriptionMutation } from '@/store/api/subscriptionApi';
import { useVerifyPaymentMutation, useGetShippingMethodsQuery } from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { CountryCodePicker, ALL_COUNTRY_CODES } from '@/components/checkout/CountryCodePicker';
import { HyperPayWidgetModal } from '@/components/checkout/HyperPayWidgetModal';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCw,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  X,
  Loader2,
  MapPin,
  ExternalLink,
  Gift,
} from 'lucide-react';

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

function splitPhone(phoneStr?: string): { code: string; number: string } {
  if (!phoneStr) return { code: '+966', number: '' };
  const cleaned = phoneStr.trim();
  for (const c of ALL_COUNTRY_CODES) {
    if (cleaned.startsWith(c.dialCode)) {
      return { code: c.dialCode, number: cleaned.slice(c.dialCode.length).trim() };
    }
  }
  if (cleaned.startsWith('+')) {
    return { code: '+966', number: cleaned.replace(/^\+966/, '').replace(/^\+/, '') };
  }
  return { code: '+966', number: cleaned.replace(/^0+/, '') };
}

const AddressMapPicker = dynamic(
  () => import('@/components/checkout/AddressMapPicker').then((mod) => mod.AddressMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-500">
        Loading interactive map...
      </div>
    ),
  }
);

interface SubscribeCheckoutPageViewProps {
  locale: Locale;
}

export function SubscribeCheckoutPageView({ locale }: SubscribeCheckoutPageViewProps) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load subscription plan config saved from previous detail page
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('grass_direct_subscription');
      if (stored) {
        try {
          setSubscriptionData(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse subscription data', e);
        }
      }
      setIsDataLoaded(true);
    }
  }, []);

  // User auth state and profile/orders
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const { data: userOrders } = useGetUserOrdersQuery(userId, {
    skip: !userId,
  });
  const { data: profileUser } = useGetUserProfileQuery(undefined, {
    skip: !userId,
  });

  // Form Fields State matching standard Checkout
  const [senderFirstName, setSenderFirstName] = useState('');
  const [senderLastName, setSenderLastName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhoneCode, setSenderPhoneCode] = useState('+966');
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
        setSenderPhoneCode(parsed.code);
        setSenderPhone((prev) => prev || parsed.number);
      }
    }
  }, [user]);

  // Saved Addresses State matching standard Checkout
  const [localAddresses, setLocalAddresses] = useState<SavedAddressOption[]>([]);
  const [deletedAddressKeys, setDeletedAddressKeys] = useState<string[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  // Close address dropdown on outside click
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
      // Ignore
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
              city: rec.city || (isAr ? 'جدة' : 'Jeddah'),
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
            city: activeProfile.city || (isAr ? 'جدة' : 'Jeddah'),
            district: activeProfile.district || '',
          });
        }
      }
    }

    return list.slice(0, 5);
  }, [user, localAddresses, userOrders, profileUser, deletedAddressKeys, isAr]);

  // Handler for selecting an address from the saved addresses dropdown
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedSavedAddress(addressId);
    if (!addressId) return;

    const found = savedAddresses.find((a) => a.id === addressId);
    if (found) {
      if (found.recipientFirstName) setRecipientFirstName(found.recipientFirstName);
      if (found.recipientLastName) setRecipientLastName(found.recipientLastName);
      if (found.recipientPhone) {
        const parsed = splitPhone(found.recipientPhone);
        setRecipientCountryCode(parsed.code);
        setRecipientPhone(parsed.number);
      }
      if (found.shippingAddress) setShippingAddress(found.shippingAddress);
      if (found.shippingAddressLink) setShippingAddressLink(found.shippingAddressLink);
      if (found.latitude !== undefined) setLatitude(found.latitude);
      if (found.longitude !== undefined) setLongitude(found.longitude);
    }
  };

  // Handler to remove a saved address with the cross icon
  const handleRemoveSavedAddress = (addrToRemove: SavedAddressOption) => {
    if (!user) return;
    const key = `${addrToRemove.shippingAddress || ''}_${addrToRemove.recipientPhone || ''}`.trim().toLowerCase();

    const newDeletedKeys = [...deletedAddressKeys, key, addrToRemove.id];
    setDeletedAddressKeys(newDeletedKeys);
    try {
      localStorage.setItem(`grass_deleted_address_keys_${user.id}`, JSON.stringify(newDeletedKeys));
    } catch { }

    const updatedLocal = localAddresses.filter(
      (a) =>
        a.id !== addrToRemove.id &&
        `${a.shippingAddress || ''}_${a.recipientPhone || ''}`.trim().toLowerCase() !== key
    );
    setLocalAddresses(updatedLocal);
    try {
      localStorage.setItem(`grass_saved_addresses_${user.id}`, JSON.stringify(updatedLocal));
    } catch { }

    if (selectedSavedAddress === addrToRemove.id) {
      setSelectedSavedAddress('');
    }
  };

  const handleMapLocationSelect = (loc: {
    address: string;
    locationLink: string;
    latitude: number;
    longitude: number;
    district?: string;
  }) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    if (loc.address) {
      setShippingAddress(loc.address);
    }
    if (loc.locationLink) {
      setShippingAddressLink(loc.locationLink);
    }
  };

  const saveAddressForUser = (addrData: {
    recipientFirstName: string;
    recipientLastName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingAddressLink?: string;
    city: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!user || !addrData.shippingAddress) return;
    try {
      const storageKey = `grass_saved_addresses_${user.id}`;
      const raw = localStorage.getItem(storageKey);
      const existing: SavedAddressOption[] = raw ? JSON.parse(raw) : [];

      const labelName = `${addrData.recipientFirstName} ${addrData.recipientLastName}`.trim();
      const label = `${labelName ? `${labelName} - ` : ''}${addrData.shippingAddress} (${addrData.city || 'Jeddah'})`;

      const newOption: SavedAddressOption = {
        id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label,
        recipientFirstName: addrData.recipientFirstName,
        recipientLastName: addrData.recipientLastName,
        recipientPhone: addrData.recipientPhone,
        shippingAddress: addrData.shippingAddress,
        shippingAddressLink: addrData.shippingAddressLink || '',
        city: addrData.city || 'Jeddah',
        district: '',
        latitude: addrData.latitude,
        longitude: addrData.longitude,
      };

      const key = `${addrData.shippingAddress}_${addrData.recipientPhone}`.trim().toLowerCase();
      const filtered = existing.filter(
        (a) => `${a.shippingAddress}_${a.recipientPhone}`.trim().toLowerCase() !== key
      );

      const updated = [newOption, ...filtered].slice(0, 5);
      setLocalAddresses(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Receiver Information state matching standard Checkout
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientCountryCode, setRecipientCountryCode] = useState('+966');
  const [recipientPhone, setRecipientPhone] = useState('');

  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressLink, setShippingAddressLink] = useState('');
  const city = isAr ? 'جدة' : 'Jeddah';
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'credit_card' | 'paypal'>('mada');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // HyperPay modal state
  const [hyperPayModalOpen, setHyperPayModalOpen] = useState(false);
  const [hyperPayConfig, setHyperPayConfig] = useState<any>(null);

  // Success state
  const [createdSubscription, setCreatedSubscription] = useState<any>(null);

  const [checkoutSubscription] = useCheckoutSubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  // Handle Return from HyperPay 3DS redirect
  useEffect(() => {
    const resourcePath = searchParams.get('resourcePath') || searchParams.get('resource_path');
    const orderNumber = searchParams.get('order_number') || searchParams.get('id');

    if (resourcePath && orderNumber) {
      setIsSubmitting(true);
      verifyPayment({
        orderId: orderNumber,
        resourcePath,
        gateway: 'hyperpay',
      })
        .unwrap()
        .then((res) => {
          if (res?.status === 'success' || res?.is_paid) {
            setCreatedSubscription({
              subscription_number: `SUB-${orderNumber}`,
              initial_order_number: orderNumber,
            });
          } else {
            setFormError(
              isAr ? 'لم تكتمل عملية الدفع أو تم رفض البطاقة. يرجى المحاولة مرة أخرى.' : 'Payment declined or canceled.'
            );
          }
        })
        .catch((err) => {
          setFormError(err?.data?.message || 'Payment verification failed');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [searchParams, verifyPayment, isAr]);

  const planName = subscriptionData
    ? (isAr ? subscriptionData.deal_name?.ar || subscriptionData.deal_name?.en : subscriptionData.deal_name?.en || subscriptionData.deal_name?.ar)
    : (isAr ? 'الباقة المختارة' : 'Selected Plan');

  // Dynamic Shipping Methods and rates managed from Filament Admin
  const { data: shippingMethodsData } = useGetShippingMethodsQuery();
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

  const subtotal = Number(subscriptionData?.base_price || 150);
  const discountedSubtotal = Number(subscriptionData?.per_delivery_price || 135);
  const discountAmount = Math.max(0, subtotal - discountedSubtotal);

  // Dynamic Shipping Fee (Default 30 SAR matching admin and normal checkout)
  const shippingFee = Number(
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
  const discountUsd = Number((discountAmount * sarToUsdRate).toFixed(2));
  const shippingFeeUsd = Number((shippingFee * sarToUsdRate).toFixed(2));
  const vatUsd = Number((vat * sarToUsdRate).toFixed(2));
  const totalUsd = Number((total * sarToUsdRate).toFixed(2));

  const durationLabel = useMemo(() => {
    const d = subscriptionData?.duration_type;
    if (d === '1_month') return isAr ? 'شهر واحد' : '1 Month';
    if (d === '3_months') return isAr ? '3 أشهر' : '3 Months';
    if (d === '6_months') return isAr ? '6 أشهر' : '6 Months';
    if (d === '12_months') return isAr ? '12 شهراً' : '12 Months';
    return isAr ? '3 أشهر' : '3 Months';
  }, [subscriptionData?.duration_type, isAr]);

  const frequencyLabel = useMemo(() => {
    const f = subscriptionData?.frequency;
    if (f === 'weekly') return isAr ? 'أسبوعياً' : 'Weekly';
    if (f === 'biweekly') return isAr ? 'كل أسبوعين' : 'Bi-weekly';
    if (f === 'monthly') return isAr ? 'شهرياً' : 'Monthly';
    return isAr ? 'أسبوعياً' : 'Weekly';
  }, [subscriptionData?.frequency, isAr]);

  // Submit Handler
  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const newErrors: Record<string, string> = {};
    if (!senderFirstName.trim()) {
      newErrors.senderFirstName = isAr ? 'يرجى إدخال الاسم الأول' : 'First name is required';
    }
    if (!senderEmail.trim()) {
      newErrors.senderEmail = isAr ? 'يرجى إدخال البريد الإلكتروني' : 'Email is required';
    }
    if (!senderPhone.trim()) {
      newErrors.senderPhone = isAr ? 'يرجى إدخال رقم الهاتف' : 'Phone is required';
    }

    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = isAr ? 'يرجى إدخال عنوان الشحن' : 'Shipping address is required';
    }
    if (!recipientFirstName.trim()) {
      newErrors.recipientFirstName = isAr ? 'يرجى إدخال اسم المستلم الأول' : 'Recipient first name is required';
    }
    if (!recipientLastName.trim()) {
      newErrors.recipientLastName = isAr ? 'يرجى إدخال اسم عائلة المستلم' : 'Recipient last name is required';
    }
    if (!recipientPhone.trim()) {
      newErrors.recipientPhone = isAr ? 'يرجى إدخال رقم هاتف المستلم' : 'Phone number is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setFormError(isAr ? 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.' : 'Please fill all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullSenderPhone = `${senderPhoneCode}${senderPhone.replace(/^0+/, '')}`;
      const fullRecipientPhone = `${recipientCountryCode}${recipientPhone.replace(/^0+/, '')}`;
      const fullRecipientName = `${recipientFirstName} ${recipientLastName}`.trim();

      // Map payment gateway string
      let gatewayKey = 'hyperpay';
      if (paymentMethod === 'paypal') gatewayKey = 'paypal';

      const payload = {
        product_id: subscriptionData?.product_id || subscriptionData?.deal_id,
        quantity: 1,
        frequency: subscriptionData?.frequency || 'weekly',
        duration_type: subscriptionData?.duration_type || '3_months',
        start_date: subscriptionData?.start_date || new Date().toISOString().split('T')[0],
        delivery_time_slot: subscriptionData?.delivery_time_slot || 'Morning (09:00 AM - 01:00 PM)',
        recipient_name: fullRecipientName,
        recipient_phone: fullRecipientPhone,
        email: senderEmail,
        address: `${shippingAddress}, Jeddah`,
        address_2: '',
        city: 'Jeddah',
        district: '',
        location_link: shippingAddressLink || undefined,
        card_message: subscriptionData?.gift_message || undefined,
        payment_gateway: gatewayKey,
        payment_brand: paymentMethod === 'mada' ? 'MADA' : (paymentMethod === 'credit_card' ? 'VISA MASTER' : undefined),
      };

      const res = await checkoutSubscription(payload).unwrap();

      if (res?.success) {
        // Persist newly used address into user saved list
        saveAddressForUser({
          recipientFirstName,
          recipientLastName,
          recipientPhone: fullRecipientPhone,
          shippingAddress,
          shippingAddressLink,
          city: 'Jeddah',
          latitude,
          longitude,
        });

        // Online Gateway Handling
        if (gatewayKey === 'hyperpay' && res?.data?.payment?.checkout_id) {
          setHyperPayConfig({
            checkoutId: res.data.payment.checkout_id,
            scriptUrl: res.data.payment.script_url,
            brands: paymentMethod === 'mada' ? 'MADA' : 'VISA MASTER',
            orderNumber: res.data.initial_order?.order_number || `OR-${res.data.initial_order?.id}`,
            amount: res.data.initial_order?.total_amount || total,
          });
          setHyperPayModalOpen(true);
          setIsSubmitting(false);
          return;
        }

        // COD or Direct Success
        setCreatedSubscription(res?.data?.subscription || {
          subscription_number: 'SUB-2026-ACTIVE',
          initial_order_number: res?.data?.initial_order?.order_number,
        });

        // Clear session data
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('grass_direct_subscription');
        }
      } else {
        setFormError(res?.message || 'Failed to initiate subscription');
      }
    } catch (err: any) {
      console.error('Subscription Checkout Error:', err);
      setFormError(err?.data?.message || err?.message || 'Failed to place subscription order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no data in session and not loading
  if (isDataLoaded && !subscriptionData && !createdSubscription) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#FDFCFB] text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
          <RotateCw className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isAr ? 'لم يتم تحديد باقة اشتراك بعد' : 'No Subscription Plan Selected'}
        </h2>
        <p className="text-sm text-[#7D7065] mb-6 max-w-md">
          {isAr
            ? 'يرجى اختيار باقة وتحديد جدول التوصيل أولاً للوصول لصفحة الدفع المباشر.'
            : 'Please select a subscription deal first to proceed with direct checkout.'}
        </p>
        <Link
          href={isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals'}
          className="px-8 py-3 rounded-xl bg-[#8fae2a] text-white font-bold text-sm shadow-md"
        >
          {isAr ? 'استعراض باقات الاشتراكات' : 'Browse Subscription Deals'}
        </Link>
      </div>
    );
  }

  // ================= SUCCESS CONFIRMATION SCREEN =================
  if (createdSubscription) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-[#FDFCFB]">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isAr ? 'تم تفعيل اشتراكك بنجاح! 🌸' : 'Subscription Confirmed! 🌸'}
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {isAr
                ? 'شكراً لك! تم جدولة توصيل باقاتك الدورية بنجاح. أرسلنا تفاصيل الاشتراك إلى بريدك الإلكتروني.'
                : 'Thank you! Your recurring floral deliveries are successfully activated. We sent full details to your email.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">{isAr ? 'رقم الاشتراك:' : 'Subscription #:'}</span>
              <span className="font-mono font-bold text-[#8fae2a]">
                {createdSubscription.subscription_number || 'SUB-2026-ACTIVE'}
              </span>
            </div>
            {createdSubscription.initial_order_number && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{isAr ? 'رقم الطلب الأول:' : 'First Order #:'}</span>
                <span className="font-mono font-bold text-gray-800">
                  {createdSubscription.initial_order_number}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">{isAr ? 'تاريخ أول توصيلة:' : 'First Delivery Date:'}</span>
              <span className="font-bold text-gray-800">
                {subscriptionData?.start_date || new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={isAr ? '/account/subscriptions' : '/en/account/subscriptions'}
              className="flex-1 py-3 px-4 rounded-xl bg-[#8fae2a] hover:bg-[#7e9b25] text-white font-bold text-sm shadow-md transition-all text-center"
            >
              {isAr ? 'إدارة اشتراكاتي' : 'Manage Subscriptions'}
            </Link>
            <Link
              href={isAr ? '/' : '/en'}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-all text-center"
            >
              {isAr ? 'العودة للمتجر' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN CHECKOUT FORM (Matching CheckoutPageView.tsx 1:1) =================
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-text-main py-6 sm:py-10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header Breadcrumbs Bar matching CheckoutPageView */}
        <div className="mb-6 sm:mb-8 text-center">
          <nav className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-gray-400 uppercase">
            <Link
              href={isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals'}
              className="hover:text-gray-700 transition-colors"
            >
              {isAr ? 'اشتراكات الزهور' : 'SUBSCRIPTIONS'}
            </Link>
            <span>&rarr;</span>
            <span className="text-[#8fae2a] font-extrabold pb-0.5 border-b-2 border-[#8fae2a]">
              {isAr ? 'إتمام الطلب' : 'CHECKOUT'}
            </span>
            <span>&rarr;</span>
            <span className="text-gray-400">
              {isAr ? 'اكتمل الطلب' : 'ORDER COMPLETE'}
            </span>
          </nav>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div className="text-xs font-semibold">{formError}</div>
          </div>
        )}

        <form onSubmit={handleSubmitSubscription} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ================= LEFT COLUMN: SENDER & RECIPIENT INFORMATION (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-8 text-start">
            {/* 1. SENDER INFORMATION Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                {isAr ? 'معلومات المرسل' : 'SENDER INFORMATION'}
              </h2>

              <div className="space-y-4">
                {/* First Name & Last Name */}
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {isAr ? 'الاسم الأول' : 'First name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={senderFirstName}
                      onChange={(e) => setSenderFirstName(e.target.value)}
                      placeholder={isAr ? 'الاسم الأول' : 'First name'}
                      className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                        errors.senderFirstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                      }`}
                    />
                    {errors.senderFirstName && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.senderFirstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {isAr ? 'اسم العائلة' : 'Last name'}
                    </label>
                    <input
                      type="text"
                      value={senderLastName}
                      onChange={(e) => setSenderLastName(e.target.value)}
                      placeholder={isAr ? 'اسم العائلة' : 'Last name'}
                      className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8fae2a] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Email address'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                        errors.senderEmail ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                      }`}
                    />
                    {errors.senderEmail && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.senderEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      {isAr ? 'رقم الهاتف' : 'Phone number'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <CountryCodePicker
                        value={senderPhoneCode}
                        onChange={(item) => setSenderPhoneCode(item.dialCode)}
                        locale={locale}
                      />
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="5XXXXXXXX"
                        className={`flex-1 min-w-0 h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                          errors.senderPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                        }`}
                      />
                    </div>
                    {errors.senderPhone && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.senderPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- 2. RECEIVER INFORMATION ---------------- */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                {isAr ? 'معلومات المستلم' : 'RECEIVER INFORMATION'}
              </h2>

              <div className="space-y-4">
                {/* Compact Warning Notice Banner matching user design */}
                <div className="py-2.5 px-3.5 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] text-[#4A4237] flex items-center gap-3 text-xs shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                  <div className="text-[11px] sm:text-xs leading-relaxed leading-tight">
                    <strong className="font-bold text-[#1E1915]">
                      {isAr ? 'تنبيه: ' : 'WARNING: '}
                    </strong>
                    <span>
                      {isAr
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
                        {isAr
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
                      className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-2xs ${
                        isAddressDropdownOpen
                          ? 'border-[#8fae2a] ring-2 ring-[#8fae2a]/20 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MapPin className="w-4 h-4 text-[#546e3a] shrink-0" />
                        <span className="truncate block text-start">
                          {savedAddresses.find((a) => a.id === selectedSavedAddress)?.label ||
                            (isAr ? 'اختر من العناوين المحفوظة...' : 'Select from Addresses...')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isAddressDropdownOpen ? 'rotate-180 text-[#546e3a]' : ''
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
                          className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            !selectedSavedAddress
                              ? 'bg-[#8fae2a]/10 text-[#546e3a] font-bold'
                              : 'hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <span className="italic">
                            {isAr ? 'اختر من العناوين المحفوظة...' : 'Select from Addresses...'}
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
                              className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between gap-3 group transition-colors ${
                                isSelected
                                  ? 'bg-[#8fae2a]/10 text-gray-900 font-bold'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <MapPin
                                  className={`w-4 h-4 shrink-0 ${
                                    isSelected ? 'text-[#546e3a]' : 'text-gray-400 group-hover:text-gray-600'
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
                                <button
                                  type="button"
                                  title={isAr ? 'حذف العنوان' : 'Remove address'}
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
                    {isAr ? 'تحديد الموقع على الخريطة (جدة):' : 'Pin Address on Map (Jeddah):'}
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
                        {isAr ? 'عنوان الشحن' : 'Shipping address'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder={isAr ? 'اسم الحي، الشارع، أو رقم المبنى' : 'District, Street, Landmark'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                          errors.shippingAddress ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                        }`}
                      />
                      {errors.shippingAddress && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.shippingAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center justify-between">
                        <span className="truncate">{isAr ? 'رابط موقع الشحن (خرائط جوجل)' : 'Shipping address link'}</span>
                        {shippingAddressLink && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            {isAr ? 'تم التحديد' : 'Pinned'}
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
                          className={`w-full h-11 px-3.5 pe-9 text-xs border rounded-lg focus:outline-none transition-all ${
                            shippingAddressLink
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
                            title={isAr ? 'فتح الرابط في خرائط جوجل' : 'Open in Google Maps'}
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
                        {isAr ? 'اسم المستلم الأول' : 'Recipient first name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientFirstName}
                        onChange={(e) => setRecipientFirstName(e.target.value)}
                        placeholder={isAr ? 'اسم المستلم الأول' : 'Recipient first name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                          errors.recipientFirstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
                        }`}
                      />
                      {errors.recipientFirstName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.recipientFirstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        {isAr ? 'اسم عائلة المستلم' : 'Recipient last name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientLastName}
                        onChange={(e) => setRecipientLastName(e.target.value)}
                        placeholder={isAr ? 'اسم العائلة' : 'Recipient last name'}
                        className={`w-full h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                          errors.recipientLastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
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
                        {isAr ? 'رقم هاتف المستلم' : 'Phone number'} <span className="text-red-500">*</span>
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
                          className={`flex-1 min-w-0 h-11 px-3.5 text-xs bg-white border rounded-lg focus:outline-none transition-all ${
                            errors.recipientPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#8fae2a]'
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
                        {isAr ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        readOnly
                        className="w-full h-11 px-3.5 text-xs bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: YOUR ORDER & PAYMENT (5 cols, sticky) ================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-36 text-start">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-5">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase border-b border-gray-100 pb-3">
                {isAr ? 'طلبك' : 'YOUR ORDER'}
              </h2>

              {/* Product and Subtotal heading */}
              <div className="flex justify-between items-center text-xs font-extrabold text-gray-500 uppercase pb-2 border-b border-gray-100">
                <span>{isAr ? 'المنتج' : 'PRODUCT'}</span>
                <span>{isAr ? 'المجموع' : 'SUBTOTAL'}</span>
              </div>

              {/* Subscription Item Row */}
              <div className="py-3 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                  <Image
                    src={subscriptionData?.deal_image || '/images/placeholder.jpg'}
                    alt={planName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">
                    {planName}
                  </h4>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#435849] bg-[#EBF3E8] px-2 py-0.5 rounded-md">
                      <RotateCw className="w-3 h-3 text-[#546e3a]" />
                      <span>{isAr ? 'اشتراك' : 'Subscription'}</span>
                    </span>
                    <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      {frequencyLabel}
                    </span>
                    <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      {durationLabel}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-1">
                    {isAr ? 'أول توصيلة:' : 'First delivery:'} {subscriptionData?.start_date}
                  </p>
                </div>

                <div dir="ltr" className="text-xs font-bold text-gray-900 shrink-0 text-end">
                  <div className="flex items-center gap-1 justify-end">
                    <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                    <span>{discountedSubtotal} SAR</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    ${(discountedSubtotal * sarToUsdRate).toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Order Totals Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
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

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>{isAr ? 'خصم الاشتراك' : 'Subscription Discount'}</span>
                    <div dir="ltr" className="text-end">
                      <span className="flex items-center justify-end gap-1">
                        <span>-</span>
                        <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                        <span>{discountAmount} SAR</span>
                      </span>
                      <span className="text-[10.5px] text-emerald-500 font-normal block">
                        -${discountUsd} USD
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>
                    {activeShippingMethod
                      ? (isAr
                        ? (activeShippingMethod.name_ar || activeShippingMethod.name)
                        : (activeShippingMethod.name_en || activeShippingMethod.name))
                      : (isAr ? 'التوصيل داخل جدة' : 'Delivery Inside Jeddah')}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {shippingFee === 0 ? (
                      isAr ? 'توصيل مجاني' : 'Free Delivery'
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
                    {isAr
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
                    <span>{isAr ? 'المجموع' : 'Total'} (SAR)</span>
                    <span dir="ltr" className="text-[#8fae2a] flex items-center gap-1 text-lg">
                      <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                      <span>{Number(total).toFixed(2)} SAR</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span>{isAr ? 'المجموع المقابل بالدولار الأمريكي:' : 'Equivalent in US Dollar:'}</span>
                    <span dir="ltr" className="text-[#a2c03e] font-extrabold text-sm">
                      ${totalUsd} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Security and Payment Gateways Radio List matching standard checkout */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <span className="text-xs font-extrabold text-gray-700 uppercase block">
                  {isAr ? 'طريقة الدفع' : 'PAYMENT METHOD'}
                </span>

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
                    <span>{isAr ? 'بطاقة مدى البنكية' : 'mada debit card'}</span>
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
                    <span>{isAr ? 'البطاقات الائتمانية' : 'Credit Cards Payment'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                    <img src="/payments/mastercard.svg" alt="Mastercard" className="h-4 object-contain" />
                    <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />
                  </div>
                </label>

                {/* 3. PayPal */}
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
                    <span>PayPal</span>
                  </div>
                  <img src="/payments/paypal.svg" alt="PayPal" className="h-4 object-contain shrink-0" />
                </label>
              </div>

              {/* Privacy and Security Note */}
              <div className="pt-2 text-center space-y-2">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {isAr
                    ? 'سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك في هذا الموقع كما هو موضح في سياسة الخصوصية.'
                    : 'Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.'}
                </p>
              </div>

              {/* PLACE ORDER Button matching standard Checkout */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-[#8fae2a] hover:bg-[#7e9b25]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{isAr ? 'تأكيد الطلب والدفع' : 'PLACE ORDER'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* HyperPay Widget Modal for 3DS verification */}
      {hyperPayModalOpen && hyperPayConfig && (
        <HyperPayWidgetModal
          isOpen={hyperPayModalOpen}
          checkoutId={hyperPayConfig.checkoutId}
          scriptUrl={hyperPayConfig.scriptUrl}
          brands={hyperPayConfig.brands}
          orderNumber={hyperPayConfig.orderNumber}
          amount={hyperPayConfig.amount}
          locale={locale}
          onClose={() => setHyperPayModalOpen(false)}
        />
      )}
    </div>
  );
}
