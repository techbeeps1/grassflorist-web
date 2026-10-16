'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { type Locale } from '@/config/site';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import { useAppSelector } from '@/store';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CountryCodePicker } from '@/components/checkout/CountryCodePicker';
import {
  RotateCw,
  Calendar,
  Clock,
  MapPin,
  Pause,
  Play,
  FastForward,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  Edit2,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

// Dynamically load AddressMapPicker to avoid SSR window issues
const AddressMapPicker = dynamic(
  () => import('@/components/checkout/AddressMapPicker').then((mod) => mod.AddressMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 sm:h-52 w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-gray-400">
        Loading interactive map...
      </div>
    ),
  }
);

interface CustomerSubscriptionsDashboardProps {
  locale: Locale;
}

export function CustomerSubscriptionsDashboard({ locale }: CustomerSubscriptionsDashboardProps) {
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;
  const authUser = useAppSelector((state) => state.auth.user);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('grass_auth_user');
        if (stored) {
          setLocalUser(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  const effectiveUser = authUser || localUser;
  const userId = effectiveUser?.id || null;

  const getApiUrl = (endpoint: string) => {
    let base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    base = base.replace(/\/+$/, '');
    if (!base.endsWith('/api')) {
      base = `${base}/api`;
    }
    const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '').replace(/^(en|ar)\//, '');
    const activeLocale = locale === 'en' ? 'en' : 'ar';
    return `${base}/${activeLocale}/${cleanEndpoint}`;
  };

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('grass_auth_token') || localStorage.getItem('token') || localStorage.getItem('customer_token')
      : null;
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const formatDeliveryDate = (dateStr?: string | null) => {
    if (!dateStr) return isAr ? 'غير محدد' : 'Not scheduled';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isAr ? 'ar-SA-u-nu-latn' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeSlot = (slot?: string | null) => {
    if (!slot) return isAr ? 'أي وقت' : 'Anytime';
    if (slot.includes(':')) {
      const parts = slot.split(':');
      const hour = parseInt(parts[0], 10);
      if (!isNaN(hour)) {
        const ampm = hour >= 12 ? (isAr ? 'مساءً' : 'PM') : (isAr ? 'صباحاً' : 'AM');
        const h12 = hour % 12 || 12;
        return `${h12}:${parts[1] || '00'} ${ampm}`;
      }
    }
    return slot;
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isAr ? 'تم التوصيل' : 'Delivered'}</span>
          </span>
        );
      case 'processing':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>{isAr ? 'قيد التجهيز' : 'Processing'}</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span>{isAr ? 'مجدول' : 'Scheduled'}</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <FastForward className="w-3 h-3 text-gray-500" />
            <span>{isAr ? 'تم التخطي' : 'Skipped'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>{isAr ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Selected subscription for detailed modal
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sub-modals
  const [rescheduleDelivery, setRescheduleDelivery] = useState<any | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Address Modal matching Checkout Page Exactly
  const [addressModalSub, setAddressModalSub] = useState<any | null>(null);
  const [editRecipientFirstName, setEditRecipientFirstName] = useState('');
  const [editRecipientLastName, setEditRecipientLastName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+966');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('Jeddah');
  const [editAddress, setEditAddress] = useState('');
  const [editAddressLink, setEditAddressLink] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);

  const openAddressModal = (sub: any) => {
    setAddressModalSub(sub);
    const addr = sub.delivery_address || {};
    const fullRecipient = (addr.recipient_name || '').trim();
    const nameParts = fullRecipient.split(' ');
    setEditRecipientFirstName(nameParts[0] || '');
    setEditRecipientLastName(nameParts.slice(1).join(' ') || '');

    // Parse phone & country code
    let rawPhone = (addr.recipient_phone || '').trim();
    let foundCode = '+966';
    for (const c of ['+966', '+971', '+965', '+974', '+973', '+968', '+20', '+91', '+1']) {
      if (rawPhone.startsWith(c)) {
        foundCode = c;
        rawPhone = rawPhone.slice(c.length).trim();
        break;
      }
    }
    setEditCountryCode(foundCode);
    setEditPhone(rawPhone);

    setEditCity(addr.city || 'Jeddah');
    setEditAddress(addr.address || '');
    setEditAddressLink(addr.address_2 || '');
    setEditDistrict(addr.district || '');
  };

  const [cancelModalSub, setCancelModalSub] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [messageToast, setMessageToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessageToast({ text, type });
    setTimeout(() => setMessageToast(null), 4000);
  };

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const userParam = userId ? `&user_id=${userId}` : '';
      const statusParam = statusFilter !== 'all' ? `status=${statusFilter}` : 'status=all';
      const url = getApiUrl(`my-account/subscriptions?${statusParam}${userParam}`);
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        setSubscriptions(json.data?.data || json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch subscriptions', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, userId]);

  const fetchSubDetails = async (id: number) => {
    try {
      const userParam = userId ? `?user_id=${userId}` : '';
      const res = await fetch(getApiUrl(`my-account/subscriptions/${id}${userParam}`), {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        setSelectedSub(json.data);
        setIsDetailModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to fetch subscription details', e);
    }
  };

  // Pause Action
  const handlePause = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(getApiUrl(`my-account/subscriptions/${id}/pause${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Paused by customer from dashboard', user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم إيقاف الاشتراك مؤقتاً بنجاح.' : 'Subscription paused successfully.');
        fetchSubscriptions();
        if (selectedSub?.id === id) fetchSubDetails(id);
      } else {
        showToast(data.message || 'Failed to pause', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Resume Action
  const handleResume = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(getApiUrl(`my-account/subscriptions/${id}/resume${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم استئناف الاشتراك بنجاح.' : 'Subscription resumed successfully.');
        fetchSubscriptions();
        if (selectedSub?.id === id) fetchSubDetails(id);
      } else {
        showToast(data.message || 'Failed to resume', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Skip Next Delivery Action
  const handleSkipNext = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(getApiUrl(`my-account/subscriptions/${id}/skip-next${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم تخطي موعد التوصيل القادم بنجاح.' : 'Next delivery skipped successfully.');
        fetchSubscriptions();
        if (selectedSub?.id === id) fetchSubDetails(id);
      } else {
        showToast(data.message || 'Failed to skip', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reschedule Submit
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDelivery || !selectedSub) return;

    setIsRescheduling(true);
    try {
      const res = await fetch(
        getApiUrl(`my-account/subscriptions/${selectedSub.id}/deliveries/${rescheduleDelivery.id}/reschedule${userId ? `?user_id=${userId}` : ''}`),
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            new_date: newRescheduleDate,
            new_time_slot: newRescheduleSlot || rescheduleDelivery.time_slot || 'Morning (09:00 AM - 01:00 PM)',
            user_id: userId,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم إعادة جدولة موعد التوصيل بنجاح.' : 'Delivery rescheduled successfully.');
        setRescheduleDelivery(null);
        fetchSubDetails(selectedSub.id);
        fetchSubscriptions();
      } else {
        showToast(data.message || 'Failed to reschedule', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsRescheduling(false);
    }
  };

  // Address Update Submit
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressModalSub) return;

    try {
      const combinedName = [editRecipientFirstName.trim(), editRecipientLastName.trim()].filter(Boolean).join(' ');
      const cleanPhoneDigits = editPhone.replace(/[^\d]/g, '');
      const combinedPhone = `${editCountryCode}${cleanPhoneDigits}`;

      const res = await fetch(getApiUrl(`my-account/subscriptions/${addressModalSub.id}/address${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          recipient_name: combinedName || editRecipientFirstName.trim(),
          recipient_phone: combinedPhone,
          address: editAddress,
          address_2: editAddressLink,
          city: 'Jeddah',
          district: editDistrict,
          user_id: userId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم تحديث عنوان التوصيل بنجاح.' : 'Delivery address updated successfully.');
        setAddressModalSub(null);
        fetchSubscriptions();
        if (selectedSub?.id === addressModalSub.id) fetchSubDetails(addressModalSub.id);
      } else {
        showToast(data.message || 'Failed to update address', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Cancel Subscription Submit
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSub) return;

    setIsCancelling(true);
    try {
      const res = await fetch(getApiUrl(`my-account/subscriptions/${cancelModalSub.id}/cancel${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by customer', user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'تم إلغاء الاشتراك بنجاح.' : 'Subscription cancelled successfully.');
        setCancelModalSub(null);
        fetchSubscriptions();
        if (selectedSub?.id === cancelModalSub.id) fetchSubDetails(cancelModalSub.id);
      } else {
        showToast(data.message || 'Failed to cancel', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Retry Failed Payment
  const handleRetryPayment = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(getApiUrl(`my-account/subscriptions/${id}/retry-payment${userId ? `?user_id=${userId}` : ''}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isAr ? 'نجحت إعادة محاولة الدفع وتم تأكيد التوصيل!' : 'Payment retry succeeded! Delivery confirmed.');
        fetchSubscriptions();
        if (selectedSub?.id === id) fetchSubDetails(id);
      } else {
        showToast(data.message || 'Payment retry declined', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>{isAr ? 'نشط' : 'Active'}</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Pause className="w-3 h-3 text-amber-700" />
            <span>{isAr ? 'متوقف مؤقتاً' : 'Paused'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>{isAr ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>{isAr ? 'مكتمل' : 'Completed'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Toast Notification */}
      {messageToast && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-md transition-all ${
            messageToast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <span>{messageToast.text}</span>
          <button type="button" onClick={() => setMessageToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4D8CB]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2C382F] flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-emerald-700" />
            <span>{isAr ? 'اشتراكاتي الدورية' : 'My Subscriptions'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6E65] mt-1">
            {isAr
              ? 'إدارة خطط التوصيل الدوري، تخطي المواعيد، تغيير العنوان أو الإيقاف المؤقت'
              : 'Manage recurring deliveries, skip upcoming cycles, update address or pause'}
          </p>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E4D8CB]/80">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'active', label: isAr ? 'نشط' : 'Active' },
            { id: 'paused', label: isAr ? 'متوقف' : 'Paused' },
            { id: 'cancelled', label: isAr ? 'ملغي' : 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#6B5E55] hover:text-[#2C382F] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#435849] mx-auto" />
          <p className="text-xs sm:text-sm text-[#7A6E65]">
            {isAr ? 'جاري تحميل الاشتراكات...' : 'Loading subscriptions...'}
          </p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-[#E4D8CB] p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <RotateCw className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2C382F]">
              {isAr ? 'لا توجد اشتراكات حالياً' : 'No subscriptions found'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6E65] max-w-md mx-auto mt-1">
              {isAr
                ? 'استمتع بتوصيل دوري متجدد لأجمل باقات الزهور مع خصم 10% دائم عند اختيار "اشتراك متكرر" من صفحة أي منتج.'
                : 'Enjoy recurring fresh floral plans with a 10% discount on every delivery by choosing "Subscribe & Save".'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subscriptions.map((sub) => {
            const prod = sub.product;
            const prodName = isAr
              ? prod?.name?.ar || prod?.name?.en || 'باقة زهور دورية'
              : prod?.name?.en || prod?.name?.ar || 'Subscription Bouquet';

            const isActionLoading = actionLoadingId === sub.id;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-[#E4D8CB] p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Product, Status & Ref */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4D8CB]/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={formatStorageUrl(prod?.thumbnail || prod?.image)}
                      alt={prodName}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E4D8CB] bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          #{sub.subscription_number}
                        </span>
                        {getStatusBadge(sub.status)}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#2C382F] mt-0.5">
                        {prodName}
                      </h3>
                      <p className="text-xs text-[#7A6E65]">
                        {isAr
                          ? `الكمية: ${sub.quantity} | ${sub.frequency} | ${sub.duration_type}`
                          : `Qty: ${sub.quantity} | ${sub.frequency} | ${sub.duration_type}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-start sm:text-end">
                    <span className="text-[11px] text-[#7A6E65] block">
                      {isAr ? 'المبلغ لكل توصيل' : 'Per Delivery Amount'}
                    </span>
                    <PriceDisplay
                      amount={sub.total_per_delivery}
                      locale={locale}
                      className="text-lg font-black text-emerald-800"
                      symbolClassName="w-4 h-4"
                    />
                  </div>
                </div>

                {/* Schedule Snapshot & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C524B] bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E4D8CB]/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#435849] shrink-0" />
                    <div>
                      <span className="text-[#8C8075] block text-[10px] uppercase font-bold">
                        {isAr ? 'موعد التوصيل القادم' : 'Next Scheduled Delivery'}
                      </span>
                      <span className="font-extrabold text-[#2C382F]">
                        {formatDeliveryDate(sub.next_delivery_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#435849] shrink-0" />
                    <div className="truncate">
                      <span className="text-[#8C8075] block text-[10px] uppercase font-bold">
                        {isAr ? 'عنوان التوصيل' : 'Delivery Address'}
                      </span>
                      <span className="font-medium text-[#2C382F] truncate block">
                        {sub.delivery_address?.address || sub.delivery_address?.city || 'Jeddah'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fetchSubDetails(sub.id)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#2C382F] border border-[#DDD3C4] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isAr ? 'عرض جدول التوصيلات' : 'View Delivery Schedule'}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 ms-auto">
                    {/* Retry payment button if failed */}
                    {sub.failed_payment_attempts > 0 && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleRetryPayment(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إعادة محاولة الدفع' : 'Retry Payment'}</span>
                      </button>
                    )}

                    {/* Skip Next Delivery */}
                    {sub.status === 'active' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleSkipNext(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title={isAr ? 'تخطي موعد التوصيل القادم' : 'Skip next scheduled delivery'}
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تخطي القادم' : 'Skip Next'}</span>
                      </button>
                    )}

                    {/* Pause or Resume */}
                    {sub.status === 'active' ? (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handlePause(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
                      </button>
                    ) : sub.status === 'paused' ? (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleResume(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isAr ? 'استئناف' : 'Resume'}</span>
                      </button>
                    ) : null}

                    {/* Edit Address */}
                    {sub.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => openAddressModal(sub)}
                        className="p-2 rounded-xl text-[#6B5E55] hover:text-[#2C382F] hover:bg-[#FAF7F2] border border-[#DDD3C4] transition-all cursor-pointer"
                        title={isAr ? 'تعديل عنوان التوصيل' : 'Update delivery address'}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Cancel Subscription */}
                    {sub.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => setCancelModalSub(sub)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                        title={isAr ? 'إلغاء الاشتراك' : 'Cancel subscription'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 Detail Modal with Delivery Schedule Timeline */}
      {isDetailModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4D8CB] overflow-hidden my-auto max-h-[90vh] flex flex-col text-start">
            {/* Header */}
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E4D8CB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={formatStorageUrl(selectedSub.product?.thumbnail || selectedSub.product?.image)}
                  alt={selectedSub.product?.name?.ar || selectedSub.product?.name?.en}
                  className="w-12 h-12 rounded-xl object-cover border border-[#E4D8CB] bg-white shrink-0"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#2C382F] flex items-center gap-2">
                    <span>
                      {isAr ? 'جدول توصيلات الاشتراك' : 'Subscription Deliveries'} #{selectedSub.subscription_number}
                    </span>
                    {getStatusBadge(selectedSub.status)}
                  </h3>
                  <p className="text-xs text-[#7A6E65]">
                    {selectedSub.product?.name?.ar || selectedSub.product?.name?.en}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-[#7A6E65] hover:text-[#2C382F] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deliveries Timeline List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A6E65]">
                {isAr ? 'الدورات المجدولة والتوصيلات السابقة' : 'Scheduled Cycles & Delivery History'}
              </h4>

              <div className="space-y-3">
                {selectedSub.deliveries?.map((del: any) => {
                  const isScheduled = del.delivery_status === 'scheduled';

                  return (
                    <div
                      key={del.id}
                      className="p-3.5 rounded-xl border border-[#E4D8CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFAF7]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          #{del.delivery_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[#2C382F]">
                              {formatDeliveryDate(del.scheduled_date)}
                            </span>
                            {getDeliveryStatusBadge(del.delivery_status)}
                          </div>
                          <span className="text-xs text-[#7A6E65] block mt-0.5">
                            {formatTimeSlot(del.time_slot)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <PriceDisplay
                          amount={del.total_amount}
                          locale={locale}
                          className="text-xs sm:text-sm font-bold text-[#2C382F]"
                          symbolClassName="w-3.5 h-3.5"
                        />

                        {isScheduled && selectedSub.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleDelivery(del);
                              setNewRescheduleDate(del.scheduled_date ? String(del.scheduled_date).split('T')[0] : '');
                              setNewRescheduleSlot(del.time_slot || 'Morning (09:00 AM - 01:00 PM)');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[#DDD3C4] bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#2C382F] flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-emerald-700" />
                            <span>{isAr ? 'تغيير الموعد' : 'Reschedule'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleDelivery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E4D8CB] space-y-4 text-start">
            <div className="flex items-center justify-between border-b border-[#E4D8CB] pb-3">
              <h3 className="font-bold text-sm sm:text-base text-[#2C382F]">
                {isAr ? 'إعادة جدولة موعد التوصيل' : 'Reschedule Delivery Cycle'}
              </h3>
              <button type="button" onClick={() => !isRescheduling && setRescheduleDelivery(null)}>
                <X className="w-5 h-5 text-[#7A6E65]" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2C382F] block mb-1">
                  {isAr ? 'التاريخ الجديد' : 'New Date'}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDD3C4]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2C382F] block mb-1">
                  {isAr ? 'الوقت المفضل' : 'Preferred Time Slot'}
                </label>
                <select
                  value={newRescheduleSlot}
                  onChange={(e) => setNewRescheduleSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDD3C4]"
                >
                  <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                  <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                  <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM - 09:00 PM)</option>
                  <option value="Anytime (09:00 AM - 09:00 PM)">Anytime</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isRescheduling}
                  onClick={() => setRescheduleDelivery(null)}
                  className="px-4 py-2 rounded-xl border border-[#DDD3C4] text-[#7A6E65] font-bold disabled:opacity-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isRescheduling && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ الموعد الجديد' : 'Save Reschedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📍 Address Update Modal matching Checkout Page Exactly */}
      {addressModalSub && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#E4D8CB] space-y-5 text-start my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E4D8CB] pb-4">
              <div>
                <h3 className="font-black text-base sm:text-lg text-[#2C382F] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>{isAr ? 'تحديث عنوان التوصيل' : 'Update Delivery Address'}</span>
                </h3>
                <p className="text-xs text-[#7A6E65] mt-0.5">
                  #{addressModalSub.subscription_number} - {isAr ? 'تعديل موقع وتفاصيل المستلم للتوصيلات القادمة' : 'Modify recipient details & location for future deliveries'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalSub(null)}
                className="p-1.5 rounded-xl text-[#7A6E65] hover:text-[#2C382F] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Google Map Section matching Checkout */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  {isAr ? 'تحديد الموقع على الخريطة (جدة):' : 'Pin Address on Map (Jeddah):'}
                </label>
                <AddressMapPicker
                  locale={locale}
                  initialAddress={editAddress}
                  initialLink={editAddressLink}
                  onLocationSelect={(data) => {
                    setEditAddress(data.address);
                    setEditAddressLink(data.locationLink);
                    setEditLatitude(data.latitude);
                    setEditLongitude(data.longitude);
                    if (data.district) {
                      setEditDistrict(data.district);
                    }
                  }}
                />
              </div>

              {/* Shipping Address & Link inputs matching Checkout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {isAr ? 'عنوان الشحن' : 'Shipping address'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder={isAr ? 'اسم الحي، الشارع، أو رقم المبنى' : 'District, Street, Landmark'}
                    className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#435849] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1 flex items-center justify-between">
                    <span>{isAr ? 'رابط موقع الشحن (خرائط جوجل)' : 'Shipping address link'}</span>
                    {editAddressLink && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {isAr ? 'تم التحديد' : 'Pinned'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={editAddressLink}
                      readOnly={Boolean(editAddressLink)}
                      onChange={(e) => setEditAddressLink(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full h-11 px-3.5 pe-9 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-mono text-[11px] focus:outline-none"
                    />
                    {editAddressLink && (
                      <a
                        href={editAddressLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute end-3 top-3 text-[#435849] hover:text-emerald-700"
                        title={isAr ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient First & Last Name matching Checkout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {isAr ? 'اسم المستلم الأول' : 'Recipient first name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRecipientFirstName}
                    onChange={(e) => setEditRecipientFirstName(e.target.value)}
                    placeholder={isAr ? 'اسم المستلم الأول' : 'Recipient first name'}
                    className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#435849] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {isAr ? 'اسم عائلة المستلم' : 'Recipient last name'}
                  </label>
                  <input
                    type="text"
                    value={editRecipientLastName}
                    onChange={(e) => setEditRecipientLastName(e.target.value)}
                    placeholder={isAr ? 'اسم العائلة' : 'Recipient last name'}
                    className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#435849] transition-all"
                  />
                </div>
              </div>

              {/* Phone with Country Code & Fixed City matching Checkout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {isAr ? 'رقم هاتف المستلم' : 'Phone number'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodePicker
                      value={editCountryCode}
                      onChange={(item) => setEditCountryCode(item.dialCode)}
                      locale={locale}
                    />
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="5XXXXXXXX"
                      className="flex-1 min-w-0 h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#435849] transition-all"
                    />
                  </div>
                </div>

                {/* City - Fixed & Readonly to Jeddah matching Checkout */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {isAr ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={isAr ? 'جدة' : 'Jeddah'}
                    readOnly
                    className="w-full h-11 px-3.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-semibold cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#E4D8CB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddressModalSub(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ العنوان' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalSub && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4 text-start">
            <div className="flex items-center justify-between border-b border-[#E4D8CB] pb-3">
              <h3 className="font-bold text-sm sm:text-base text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5" />
                <span>{isAr ? 'إلغاء خطة الاشتراك' : 'Cancel Subscription Plan'}</span>
              </h3>
              <button type="button" onClick={() => !isCancelling && setCancelModalSub(null)}>
                <X className="w-5 h-5 text-[#7A6E65]" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <p className="text-[#5C524B]">
                {isAr
                  ? 'هل أنت متأكد من رغبتك في إلغاء هذا الاشتراك؟ سيتم إلغاء جميع التوصيلات المجدولة المستقبلية.'
                  : 'Are you sure you want to cancel this subscription? All future scheduled deliveries will be cancelled.'}
              </p>

              <div>
                <label className="font-bold text-[#2C382F] block mb-1">
                  {isAr ? 'سبب الإلغاء (اختياري)' : 'Reason for Cancellation (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={isAr ? 'أسباب السفر، تغيير السكن، إلخ...' : 'Moving, travel, etc...'}
                  className="w-full p-2.5 rounded-xl border border-[#DDD3C4]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelModalSub(null)}
                  className="px-4 py-2 rounded-xl border border-[#DDD3C4] text-[#7A6E65] font-bold disabled:opacity-50"
                >
                  {isAr ? 'تراجع' : 'Keep Subscription'}
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'تأكيد الإلغاء' : 'Confirm Cancel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
