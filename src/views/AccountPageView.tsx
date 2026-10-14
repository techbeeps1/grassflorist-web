'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import {
  useGetUserOrdersQuery,
  useUpdateProfileMutation,
  useGetUserProfileQuery,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
} from '@/store/api/authApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useGetShippingMethodsQuery } from '@/store/api/checkoutApi';
import { useWishlist } from '@/hooks/useWishlist';
import { Order } from '@/types/order';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { CountrySelect } from '@/components/common/CountrySelect';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Gift,
  Music,
  FileText,
  Lock,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  RotateCw,
} from 'lucide-react';
import { CustomerSubscriptionsDashboard } from '@/components/subscription/CustomerSubscriptionsDashboard';

interface AccountPageViewProps {
  locale: Locale;
}

type AccountTab = 'profile' | 'orders' | 'subscriptions' | 'addresses' | 'security';

function AccountPageContent({ locale }: AccountPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useWishlist(locale);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

  const tabParam = searchParams.get('tab');
  const getInitialTab = (): AccountTab => {
    if (tabParam === 'orders') return 'orders';
    if (tabParam === 'subscriptions') return 'subscriptions';
    if (tabParam === 'addresses') return 'addresses';
    if (tabParam === 'security' || tabParam === 'password') return 'security';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState<AccountTab>(getInitialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync tab from URL query params (e.g. when navigated via header dropdown or links)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'subscriptions' || tab === 'addresses' || tab === 'security' || tab === 'password' || tab === 'profile') {
      setActiveTab((tab === 'password' ? 'security' : tab) as AccountTab);
    }
  }, [searchParams]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'orders' || tab === 'subscriptions' || tab === 'addresses' || tab === 'security' || tab === 'password' || tab === 'profile') {
        setActiveTab((tab === 'password' ? 'security' : tab) as AccountTab);
      } else {
        setActiveTab('profile');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const basePath = locale === 'ar' ? '/account' : '/en/account';
    const newUrl = tab === 'profile' ? basePath : `${basePath}?tab=${tab}`;
    window.history.replaceState(null, '', newUrl);
  };

  // Profile Edit State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || 'Saudi Arabia');
  const [city, setCity] = useState(user?.city || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [street, setStreet] = useState(user?.street || '');
  const [isEditing, setIsEditing] = useState(false);

  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: profileUser } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const currentUser = profileUser || user;
  const { data: userOrders = [], isLoading: isOrdersLoading } = useGetUserOrdersQuery(
    currentUser?.id ? String(currentUser.id) : undefined,
    {
      skip: !isAuthenticated,
    }
  );
  const hasSavedAddress = Boolean(currentUser?.city || currentUser?.street || currentUser?.district);
  const { data: globalSettings } = useGetGlobalSettingsQuery();
  const { data: shippingMethods } = useGetShippingMethodsQuery();

  const [sendVerificationEmailMutation, { isLoading: isSendingVerification }] = useSendVerificationEmailMutation();
  const [verifyEmailMutation] = useVerifyEmailMutation();
  const [verificationSent, setVerificationSent] = useState(false);

  // Auto-verify when arriving with verify_token query param
  useEffect(() => {
    const verifyToken = searchParams.get('verify_token');
    if (verifyToken) {
      verifyEmailMutation({ token: verifyToken })
        .unwrap()
        .then((res: any) => {
          dispatch(
            updateUser({
              emailVerified: true,
              emailVerifiedAt: new Date().toISOString(),
            })
          );
          dispatch(
            addToast({
              type: 'success',
              message: res?.message || (locale === 'ar' ? 'تم تأكيد بريدك الإلكتروني بنجاح!' : 'Email verified successfully!'),
            })
          );
          const basePath = locale === 'ar' ? '/account' : '/en/account';
          window.history.replaceState(null, '', `${basePath}?tab=profile`);
        })
        .catch((err: any) => {
          dispatch(
            addToast({
              type: 'error',
              message: err?.data?.message || (locale === 'ar' ? 'رابط التأكيد غير صالح أو منتهي الصلاحية.' : 'Invalid or expired verification link.'),
            })
          );
        });
    }
  }, [searchParams, verifyEmailMutation, dispatch, locale]);

  const handleSendVerificationEmail = async () => {
    try {
      const res = await sendVerificationEmailMutation({ email: currentUser?.email }).unwrap();
      setVerificationSent(true);
      dispatch(
        addToast({
          type: 'success',
          message: res?.message || (locale === 'ar'
            ? 'تم إرسال رابط تأكيد البريد الإلكتروني. يرجى مراجعة صندوق الوارد.'
            : 'Verification link sent to your email! Please check your inbox.'),
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.message || (locale === 'ar'
            ? 'تعذر إرسال رابط التأكيد، يرجى المحاولة لاحقاً.'
            : 'Failed to send verification email. Please try again later.'),
        })
      );
    }
  };

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword) {
      setPasswordError(
        locale === 'ar' ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter a new password'
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        locale === 'ar'
          ? 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف'
          : 'New password must be at least 8 characters long'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        locale === 'ar'
          ? dict.auth.passwordMismatch || 'كلمتا المرور غير متطابقتين'
          : dict.auth.passwordMismatch || 'Passwords do not match'
      );
      return;
    }

    try {
      const res = await changePasswordMutation({
        currentPassword: currentPassword || undefined,
        password: newPassword,
        password_confirmation: confirmPassword,
        email: currentUser?.email,
      }).unwrap();

      const successMsg =
        res?.message ||
        (locale === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح!'
          : 'Password updated successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');

      dispatch(
        addToast({
          type: 'success',
          message: successMsg,
        })
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (locale === 'ar'
          ? 'فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.'
          : 'Failed to update password. Please check your current password.');
      setPasswordError(msg);
      dispatch(
        addToast({
          type: 'error',
          message: msg,
        })
      );
    }
  };

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const formatPaymentMethod = (method?: string) => {
    if (!method) return isRtl ? 'دفع إلكتروني' : 'Online Payment';
    const m = method.toLowerCase();
    if (m === 'paypal') return 'PayPal';
    if (m === 'mada') return isRtl ? 'بطاقة مدى (Mada)' : 'Mada Debit Card';
    if (m === 'credit_card' || m === 'card' || m === 'visa' || m === 'mastercard' || m === 'hyperpay') {
      return isRtl ? 'بطاقة ائتمانية' : 'Credit Card';
    }
    if (m === 'tabby') return isRtl ? 'تابي (Tabby)' : 'Tabby';
    if (m === 'tamara') return isRtl ? 'تمارا (Tamara)' : 'Tamara';
    if (m === 'apple_pay' || m === 'applepay') return 'Apple Pay';
    if (m === 'cod' || m === 'cash_on_delivery') return isRtl ? 'الدفع عند الاستلام' : 'Cash on Delivery';
    return method.toUpperCase();
  };

  const formatDeliverySlot = (rawSlot?: string | null): string => {
    if (!rawSlot) {
      return isRtl ? 'من 11:00 صباحاً وحتى 03:00 مساءً' : '11:00 AM to 03:00 PM';
    }

    const s = String(rawSlot).trim().toLowerCase();

    // If it already contains AM/PM or Arabic time words, return clean text
    if (s.includes('am') || s.includes('pm') || s.includes('صباح') || s.includes('مساء')) {
      return rawSlot;
    }

    // 11:00 AM to 03:00 PM / morning
    if (s.startsWith('11') || s.includes('morning')) {
      return isRtl ? 'من 11:00 صباحاً وحتى 03:00 مساءً' : '11:00 AM to 03:00 PM';
    }

    // 07:00 PM to 10:00 PM / evening / 19:00
    if (s.startsWith('19:00') || s.startsWith('07') || s.startsWith('7:') || s.includes('evening') || s.includes('night')) {
      return isRtl ? 'من 07:00 مساءً وحتى 10:00 مساءً' : '07:00 PM to 10:00 PM';
    }

    // 04:00 PM to 07:00 PM / 16:00
    if (s.startsWith('16') || s.startsWith('04:00') || s.startsWith('4:00')) {
      return isRtl ? 'من 04:00 مساءً وحتى 07:00 مساءً' : '04:00 PM to 07:00 PM';
    }

    // 07:30 PM to 10:00 PM / 19:30
    if (s.startsWith('19:30') || s.startsWith('07:30') || s.startsWith('7:30')) {
      return isRtl ? 'من 07:30 مساءً وحتى 10:00 مساءً' : '07:30 PM to 10:00 PM';
    }

    // afternoon
    if (s.includes('afternoon') || s.startsWith('13') || s.startsWith('14') || s.startsWith('15')) {
      return isRtl ? 'من 01:00 ظهراً وحتى 05:00 مساءً' : '01:00 PM to 05:00 PM';
    }

    // Standard 24h time like "HH:MM:SS" -> format nicely
    const parts = s.split(':');
    if (parts.length >= 2 && !isNaN(Number(parts[0]))) {
      const hour = parseInt(parts[0], 10);
      const minute = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const ampmAr = hour >= 12 ? 'مساءً' : 'صباحاً';
      const h12 = hour % 12 || 12;
      return isRtl
        ? `من ${h12}:${minute} ${ampmAr}`
        : `${h12}:${minute} ${ampm}`;
    }

    return rawSlot;
  };

  const getShippingLabel = (order?: Order | null): string => {
    const list = shippingMethods?.data || [];
    const matchedMethod = list.find(
      (sm: any) => Number(sm.price) === Number(order?.shippingFee) || sm.name === order?.shipping_method
    );
    if (matchedMethod) {
      return isRtl
        ? (matchedMethod.name_ar || matchedMethod.name || 'التوصيل داخل جدة')
        : (matchedMethod.name_en || matchedMethod.name || 'Delivery Inside Jeddah');
    }

    if (order?.shipping_method) {
      if (isRtl) {
        const smLower = order.shipping_method.toLowerCase();
        if (smLower.includes('jeddah') || smLower.includes('inside')) {
          return 'التوصيل داخل جدة';
        }
        return order.shipping_method;
      }
      return order.shipping_method;
    }

    return isRtl ? 'التوصيل داخل جدة' : 'Delivery Inside Jeddah';
  };

  const vatPercentage = globalSettings?.tax?.vat_percentage ?? 15;
  const isVatIncluded = globalSettings?.tax?.is_vat_included ?? false;
  const vatLabel = isRtl
    ? `ضريبة القيمة المضافة (${vatPercentage}%)${isVatIncluded ? ' مشمولة' : ''}`
    : `VAT (${vatPercentage}%)${isVatIncluded ? ' Included' : ''}`;

  // Protect Account Route
  useEffect(() => {
    if (!isAuthenticated) {
      const verifyToken = searchParams.get('verify_token');
      const targetQuery = verifyToken ? `?tab=profile&verify_token=${encodeURIComponent(verifyToken)}` : '';
      const redirectPath = (locale === 'ar' ? '/account' : '/en/account') + targetQuery;
      router.push(locale === 'ar' ? `/login?redirect=${encodeURIComponent(redirectPath)}` : `/en/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isAuthenticated, locale, router, searchParams]);

  useEffect(() => {
    if (profileUser) {
      dispatch(updateUser(profileUser));
    }
  }, [profileUser, dispatch]);

  useEffect(() => {
    if (currentUser) {
      const fName = currentUser.firstName || (currentUser.name ? currentUser.name.split(' ')[0] : '');
      const lName = currentUser.lastName && currentUser.lastName !== '.'
        ? currentUser.lastName
        : (currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : '');
      const cleanPhone =
        currentUser.phone &&
          currentUser.phone !== '9876543210' &&
          currentUser.phone !== '0500000000'
          ? currentUser.phone
          : '';
      setFirstName(fName);
      setLastName(lName === '.' ? '' : lName);
      setEmail(currentUser.email || '');
      setPhone(cleanPhone);
      setCountry(currentUser.country || 'Saudi Arabia');
      setCity(currentUser.city || '');
      setDistrict(currentUser.district || '');
      setStreet(currentUser.street || '');
    }
  }, [currentUser]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 rounded-full border-2 border-[#435849] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ').trim() || 'User';

      await updateProfileMutation({
        userId: currentUser.id,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: fullName,
        email,
        phone,
        country,
        city,
        district,
        street,
      }).unwrap();

      dispatch(updateUser({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: fullName,
        email,
        phone,
        country,
        city,
        district,
        street,
      }));
      setIsEditing(false);
      dispatch(
        addToast({
          type: 'success',
          message: dict.account.profileUpdated,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          message: 'Error updating profile',
        })
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      addToast({
        type: 'info',
        message: dict.auth.logoutSuccess,
      })
    );
    router.push(locale === 'ar' ? '/' : '/en');
  };

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.account.title },
  ];

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-[#C8E6CF]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{dict.account.statusDelivered}</span>
          </span>
        );
      case 'preparing':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF6E9] text-[#B87A28] border border-[#FADCB3]">
            <Clock className="w-3.5 h-3.5" />
            <span>{dict.account.statusProcessing}</span>
          </span>
        );
      case 'on_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEF5FC] text-[#2970B6] border border-[#CDE1F7]">
            <Truck className="w-3.5 h-3.5" />
            <span>{dict.account.statusShipped}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const isPaid = paymentStatus === 'paid';
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{locale === 'ar' ? 'تم السداد' : 'Paid'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>{locale === 'ar' ? 'في انتظار السداد' : 'Unpaid'}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[#FAF7F2]">
      <div className="site-container max-w-5xl mx-auto">
        <Breadcrumbs items={breadcrumbs} locale={locale} className="mb-6" />

        {/* User Greeting Hero Card */}
        <div className="bg-gradient-to-r from-[#FAF3ED] via-[#F5ECE2] to-[#EAE0D3] rounded-3xl p-6 sm:p-8 mb-8 border border-[#E4D8CB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-start">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#435849] text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md uppercase">
              {currentUser.name.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#201B18] tracking-tight">
                  {[currentUser.firstName, currentUser.lastName && currentUser.lastName !== '.' ? currentUser.lastName : ''].filter(Boolean).join(' ') || currentUser.name}
                </h1>

              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs sm:text-sm text-[#7D7065]">{currentUser.email}</p>
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                    <span>{locale === 'ar' ? 'موثّق' : 'Verified'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendingVerification}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-all cursor-pointer"
                    title={locale === 'ar' ? 'اضغط لتوثيق البريد الإلكتروني' : 'Click to verify email'}
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                    <span>{locale === 'ar' ? 'غير موثّق (اضغط للتوثيق)' : 'Unverified (Verify)'}</span>
                  </button>
                )}
              </div>
              {currentUser.phone && currentUser.phone !== '9876543210' && currentUser.phone !== '0500000000' && (
                <p className="text-xs text-[#8C8075] mt-0.5" dir="ltr">
                  {currentUser.phone}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{dict.account.logout}</span>
          </button>
        </div>

        {/* Navigation Tabs & Main Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-[#E4D8CB] shadow-xs space-y-1">
            <button
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'profile'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                }`}
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4" />
                <span>{dict.account.profileTab}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'orders'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>{dict.account.ordersTab}</span>
              </div>
              <div className="flex items-center gap-2">
                {userOrders.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'orders'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EBF1ED] text-[#435849]'
                      }`}
                  >
                    {userOrders.length}
                  </span>
                )}
                <ArrowIcon className="w-4 h-4 opacity-70" />
              </div>
            </button>

            {/* Subscriptions Tab */}
            <button
              onClick={() => handleTabChange('subscriptions')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'subscriptions'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                }`}
            >
              <div className="flex items-center gap-3">
                <RotateCw className="w-4 h-4" />
                <span>{locale === 'ar' ? 'اشتراكاتي الدورية' : 'My Subscriptions'}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabChange('addresses')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'addresses'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>{dict.account.addressesTab}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabChange('security')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'security'
                  ? 'bg-[#435849] text-white shadow-xs'
                  : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4" />
                <span>{locale === 'ar' ? 'كلمة المرور والأمان' : 'Password & Security'}</span>
              </div>
              <ArrowIcon className="w-4 h-4 opacity-70" />
            </button>

            <Link
              href={locale === 'ar' ? '/wishlist' : '/en/wishlist'}
              className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#4A4036] hover:bg-[#FAF7F2] transition-all"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{dict.account.wishlistTab}</span>
              </div>
              <div className="flex items-center gap-2">
                {wishlistItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                    {wishlistItems.length}
                  </span>
                )}
                <ArrowIcon className="w-4 h-4 opacity-70" />
              </div>
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E4D8CB] shadow-xs text-start">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E4D8CB] mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#201B18] tracking-tight">
                      {dict.account.profileTab}
                    </h2>
                    <p className="text-xs text-[#7D7065] mt-0.5">
                      {locale === 'ar'
                        ? 'عرض وتعديل معلومات حسابك المسجلة'
                        : 'Manage your personal profile and contact information'}
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EBF1ED] text-[#435849] text-xs font-bold border border-[#D5C6B5] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{dict.account.editProfile}</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Row 1: First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.firstName} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={dict.auth.firstNamePlaceholder || (locale === 'ar' ? 'الاسم الأول' : 'First Name')}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.lastName}
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={dict.auth.lastNamePlaceholder || (locale === 'ar' ? 'اسم العائلة' : 'Last Name')}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#201B18]">
                            {dict.auth.email}
                          </label>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C8075]">
                            <Lock className="w-3 h-3 text-[#8C8075]" />
                            <span>{locale === 'ar' ? 'غير قابل للتعديل' : 'Non-editable'}</span>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            readOnly
                            value={email}
                            className="w-full h-11 px-3.5 pe-9 text-xs sm:text-sm bg-[#EFE9DF] border border-[#DDD3C4] rounded-xl text-[#7D7065] cursor-not-allowed select-none focus:outline-none"
                          />
                          <Lock className="w-4 h-4 text-[#A89A8E] absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
                          <p className="text-[11px] text-[#8C8075]">
                            {locale === 'ar'
                              ? 'لا يمكن تعديل عنوان البريد لأسباب أمنية.'
                              : 'Registered email cannot be modified.'}
                          </p>
                          {currentUser.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D47]">
                              <CheckCircle2 className="w-3 h-3 text-[#2E7D47]" />
                              <span>{locale === 'ar' ? 'موثّق' : 'Verified'}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendVerificationEmail}
                              disabled={isSendingVerification}
                              className="text-[11px] font-bold text-[#C25E2E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3 h-3 text-[#C25E2E]" />
                              <span>
                                {isSendingVerification
                                  ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                                  : verificationSent
                                    ? (locale === 'ar' ? 'إعادة الإرسال' : 'Resend Link')
                                    : (locale === 'ar' ? 'تأكيد الآن' : 'Verify Now')}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.auth.phone}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          dir="ltr"
                          placeholder="05xxxxxxxx"
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849] text-start"
                        />
                      </div>
                    </div>

                    {/* Row 3: Country & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {locale === 'ar' ? 'الدولة' : 'Country'}
                        </label>
                        <CountrySelect
                          value={country}
                          onChange={(val) => setCountry(val)}
                          locale={locale}
                          className="bg-[#FAF8F5] border-[#D5C6B5] rounded-xl text-[#201B18]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryCity}
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    {/* Row 4: District & Street */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryDistrict}
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder={locale === 'ar' ? 'حي الروضة' : 'Al Rawdah'}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                          {dict.checkout.deliveryStreet}
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder={locale === 'ar' ? 'شارع الأمير سلطان' : 'Prince Sultan St'}
                          className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E4D8CB]">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isUpdating}
                        className="font-bold text-xs sm:text-sm"
                      >
                        <span>{dict.account.saveChanges}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => setIsEditing(false)}
                        className="text-xs sm:text-sm font-semibold text-[#7D7065]"
                      >
                        <span>{dict.common.close}</span>
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Profile Details View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.firstName}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">
                        {currentUser.firstName || currentUser.name?.split(' ')[0] || ''}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.lastName}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">
                        {(currentUser.lastName && currentUser.lastName !== '.' ? currentUser.lastName : currentUser.name?.split(' ').slice(1).join(' ')) || (locale === 'ar' ? 'غير مسجل' : 'Not added')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                          {dict.auth.email}
                        </span>
                        {currentUser.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3EB] text-[#2E7D47] border border-[#C5E3CE]">
                            <CheckCircle2 className="w-3 h-3 text-[#2E7D47]" />
                            <span>{locale === 'ar' ? 'موثّق' : 'Verified'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3EB] text-[#C25E2E] border border-[#FCD8C1]">
                            <AlertTriangle className="w-3 h-3 text-[#C25E2E]" />
                            <span>{locale === 'ar' ? 'غير موثّق' : 'Unverified'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-[#201B18] break-all">{currentUser.email}</p>

                      {!currentUser.emailVerified && (
                        <div className="pt-2 border-t border-[#EAE1D5] flex items-center justify-between gap-2">
                          <p className="text-[11px] text-[#7D7065] leading-tight">
                            {locale === 'ar'
                              ? 'قم بتأكيد بريدك لتأمين حسابك واستلام الفواتير'
                              : 'Verify email to secure account & receive invoices'}
                          </p>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isSendingVerification}
                            onClick={handleSendVerificationEmail}
                            className="!py-1 !px-3 text-xs shrink-0 cursor-pointer"
                          >
                            {isSendingVerification ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : verificationSent ? (
                              <span>{locale === 'ar' ? 'إعادة الإرسال' : 'Resend Link'}</span>
                            ) : (
                              <span>{locale === 'ar' ? 'تأكيد الآن' : 'Verify Now'}</span>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.auth.phone}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]" dir="ltr">
                        {currentUser.phone &&
                          currentUser.phone !== '9876543210' &&
                          currentUser.phone !== '0500000000'
                          ? currentUser.phone
                          : locale === 'ar'
                            ? 'غير مسجل'
                            : 'Not added'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {locale === 'ar' ? 'الدولة' : 'Country'}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">
                        {currentUser.country || (locale === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 space-y-1">
                      <span className="text-[11px] text-[#8C8075] font-bold uppercase block">
                        {dict.checkout.deliveryCity} & {dict.checkout.deliveryStreet}
                      </span>
                      <p className="text-sm font-extrabold text-[#201B18]">
                        {[currentUser.street, currentUser.district, currentUser.city].filter(Boolean).join(', ') ||
                          (locale === 'ar' ? 'غير مسجل' : 'Not added')}
                      </p>
                    </div>

                    {/* Password & Security Quick Access Card */}
                    <div className="col-span-1 sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB]/80 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF1ED] text-[#435849] flex items-center justify-center shrink-0">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-[#201B18]">
                            {locale === 'ar' ? 'كلمة المرور والأمان' : 'Password & Security'}
                          </p>
                          <p className="text-[11px] text-[#8C8075]">
                            {locale === 'ar'
                              ? 'يمكنك تغيير وتحديث كلمة المرور لحسابك في أي وقت لحماية بياناتك'
                              : 'Keep your account secure by updating your password regularly'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTabChange('security')}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-[#EBF1ED] text-[#435849] text-xs font-bold border border-[#D5C6B5] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#435849]" />
                        <span>{locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div>
                <div className="pb-5 border-b border-[#E8DFD3] mb-6">
                  <h2 className="text-xl font-bold text-[#1E1915] tracking-tight">
                    {dict.account.ordersTab}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7D7065] mt-1">
                    {locale === 'ar'
                      ? 'متابعة وتفاصيل كافة طلباتك مع متجر غراس'
                      : 'Track the status and history of your flower orders'}
                  </p>
                </div>

                {isOrdersLoading ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2D3F33] border-t-transparent animate-spin" />
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4 sm:space-y-5">
                    {userOrders.map((order) => {
                      const isUsdOrder = (order.currency === 'USD') || (String(order.paymentMethod || '').toLowerCase() === 'paypal');
                      const orderCurrency: 'SAR' | 'USD' = isUsdOrder ? 'USD' : 'SAR';
                      const orderRate = order.exchangeRate || 0.2667;
                      const orderDisplayTotal = isUsdOrder
                        ? (order.currencyAmount || order.usdTotal || Number((order.total * orderRate).toFixed(2)))
                        : (order.sarTotal || order.sarAmount || order.total);
                      const orderSarTotal = order.sarTotal || order.sarAmount || order.total;

                      return (
                        <div
                          key={order.orderNumber}
                          className="rounded-2xl sm:rounded-3xl border border-[#E8DFD3] bg-white hover:border-[#C4B29E] shadow-[0_2px_12px_-4px_rgba(45,36,28,0.05)] hover:shadow-[0_8px_24px_-6px_rgba(45,36,28,0.09)] transition-all overflow-hidden text-start"
                        >
                          {/* Order Header Row */}
                          <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#EFE8DE] flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                              <span className="font-mono text-xs sm:text-sm font-bold bg-white px-3 py-1 rounded-xl border border-[#E2D8CC] text-[#1E1915] shadow-2xs">
                                {order.orderNumber}
                              </span>
                              {getStatusBadge(order.status)}
                              {getPaymentStatusBadge(order.payment_status)}
                              {isUsdOrder ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {String(order.paymentMethod || '').toLowerCase() === 'paypal' ? 'PayPal (USD)' : `USD • ${formatPaymentMethod(order.paymentMethod)}`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF7F2] text-[#5C5045] border border-[#E2D8CC]">
                                  {formatPaymentMethod(order.paymentMethod)}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#7D7065] flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#8C8075]" />
                              <span>
                                {new Date(order.createdAt).toLocaleDateString(
                                  locale === 'ar' ? 'ar-SA' : 'en-US',
                                  { year: 'numeric', month: 'short', day: 'numeric' }
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="p-5 space-y-3.5">
                            {order.items.map((item, idx) => {
                              const itemSar = item.itemTotal;
                              const itemDisplayPrice = isUsdOrder
                                ? Number((itemSar * orderRate).toFixed(2))
                                : itemSar;

                              return (
                                <div key={idx} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shrink-0">
                                      {item.product.thumbnail ? (
                                        <Image
                                          src={formatStorageUrl(item.product.thumbnail)}
                                          alt={item.product.name[locale]}
                                          fill
                                          unoptimized
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#8C8075]">
                                          <Package className="w-6 h-6 opacity-40" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#8C8075] uppercase tracking-wider block mb-0.5">
                                        {item.product.category?.[locale] || (locale === 'ar' ? 'زهور فاخرة' : 'Floral Arrangement')}
                                      </span>
                                      <span className="font-bold text-[#1E1915] block truncate mb-1">
                                        {item.product.name[locale]}
                                      </span>
                                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF7F2] text-[11px] font-semibold text-[#5C5045] border border-[#E8DFD3]">
                                        {dict.product.quantity}: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-end shrink-0">
                                    <span dir="ltr" className="font-extrabold text-sm sm:text-base text-[#1E1915] inline-flex items-center gap-1">
                                      <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={orderCurrency} />
                                      <span>{itemDisplayPrice}</span>
                                    </span>
                                    {isUsdOrder && (
                                      <div className="text-[10px] text-[#8C8075] font-semibold flex items-center justify-end gap-0.5 mt-0.5" dir="ltr">
                                        <span>(</span>
                                        <CurrencySymbol forcedCurrency="SAR" size={10} className="w-2.5 h-2.5 inline -mt-0.5" />
                                        <span>{itemSar})</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Total & Action Footer */}
                          <div className="px-5 py-3.5 bg-[#FAF7F2]/60 border-t border-[#EFE8DE] flex flex-wrap items-center justify-between gap-3">
                            {/* Items Count Pill */}
                            <div className="flex items-center gap-1.5 text-xs text-[#7D7065] font-semibold">
                              <Package className="w-3.5 h-3.5 text-[#8C8075]" />
                              <span>
                                {order.items.reduce((sum, it) => sum + (it.quantity || 1), 0)}{' '}
                                {locale === 'ar' ? 'منتج' : 'items'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <div className="text-end me-1.5">
                                <span className="text-xs text-[#7D7065] me-1.5">{dict.account.orderTotal}:</span>
                                <span dir="ltr" className="font-black text-sm sm:text-base text-[#1E1915] inline-flex items-center gap-1">
                                  <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={orderCurrency} />
                                  <span>{orderDisplayTotal}</span>
                                </span>
                                {isUsdOrder && (
                                  <div className="text-[11px] text-[#8C8075] font-semibold flex items-center justify-end gap-1 mt-0.5" dir="ltr">
                                    <span>≈</span>
                                    <CurrencySymbol forcedCurrency="SAR" size={12} className="w-3 h-3 inline -mt-0.5" />
                                    <span>{orderSarTotal}</span>
                                  </div>
                                )}
                              </div>

                              {/* Unpaid Action: Pay Now */}
                              {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                                <Link
                                  href={locale === 'ar' ? `/order-pay/${order.orderNumber}` : `/en/order-pay/${order.orderNumber}`}
                                  className="px-4 py-2 rounded-xl bg-[#8fae2a] hover:bg-[#7d9b23] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>{locale === 'ar' ? 'سداد الطلب' : 'Pay Now'}</span>
                                </Link>
                              )}

                              {/* Download / Print Tax Invoice */}
                              <a
                                href={`${backendUrl}/orders/${order.orderNumber}/tax-invoice?key=${order.orderKey || ''}&print=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#2D3F33] hover:text-[#1E2B23] border border-[#D5C7B5] hover:border-[#2D3F33] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                                title={locale === 'ar' ? 'طباعة / تحميل الفاتورة الضريبية' : 'Download / Print Tax Invoice'}
                              >
                                <FileText className="w-3.5 h-3.5 text-[#8fae2a]" />
                                <span>{locale === 'ar' ? 'الفاتورة' : 'Invoice'}</span>
                              </a>

                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-4 py-2 rounded-xl bg-[#2D3F33] hover:bg-[#1E2B23] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <span>{dict.account.viewOrderDetails}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-[#FAF7F2]/50 rounded-2xl border border-[#E8DFD3] space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#FAF3ED] flex items-center justify-center text-[#2D3F33] mx-auto mb-2 border border-[#E8DFD3]">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-[#1E1915]">{dict.account.noOrders}</h3>
                    <p className="text-xs sm:text-sm text-[#7D7065] max-w-sm mx-auto">
                      {dict.account.noOrdersDesc}
                    </p>
                    <div className="pt-2">
                      <Link href={locale === 'ar' ? '/products' : '/en/products'}>
                        <Button variant="primary" size="md" className="font-bold text-xs bg-[#2D3F33] hover:bg-[#202E25] rounded-xl px-5">
                          <span>{dict.account.startShopping}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
              <CustomerSubscriptionsDashboard locale={locale} />
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD3] mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1E1915] tracking-tight">
                      {dict.account.addressesTab}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7065] mt-1">
                      {locale === 'ar'
                        ? 'العناوين المحفوظة لتسهيل وتنسيق سرعة التوصيل'
                        : 'Manage your saved delivery addresses for faster checkout'}
                    </p>
                  </div>
                  {hasSavedAddress && (
                    <button
                      onClick={() => {
                        handleTabChange('profile');
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EBF1ED] text-[#435849] text-xs font-bold border border-[#D5C6B5] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{dict.account.editProfile}</span>
                    </button>
                  )}
                </div>

                {hasSavedAddress ? (
                  <div className="p-5 rounded-2xl border border-[#2D3F33]/20 bg-[#FDFBF7] relative space-y-2 text-start">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2D3F33] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {currentUser.city
                            ? `${locale === 'ar' ? 'العنوان الافتراضي' : 'Primary Address'} (${currentUser.city})`
                            : (locale === 'ar' ? 'العنوان الافتراضي' : 'Primary Address')}
                        </span>
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#EAF5EC] text-[#2D6A4F] text-[10px] font-bold rounded-full border border-[#C8E6CF]">
                        {locale === 'ar' ? 'افتراضي' : 'Default'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#1E1915]">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-[#7D7065] leading-relaxed">
                      {[currentUser.street, currentUser.district, currentUser.city, currentUser.country || (locale === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia')].filter(Boolean).join(', ')}
                    </p>
                    {currentUser.phone && (
                      <p className="text-xs text-[#8C8075]" dir="ltr">
                        {currentUser.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-2xl border border-dashed border-[#D5C6B5] bg-[#FAF8F5]/60 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#EBF1ED] text-[#435849] flex items-center justify-center mx-auto">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[#201B18]">
                      {locale === 'ar' ? 'لا توجد عناوين محفوظة حتى الآن' : 'No saved addresses yet'}
                    </h3>
                    <p className="text-xs text-[#7D7065] max-w-sm mx-auto">
                      {locale === 'ar'
                        ? 'لم تقم بحفظ أي عنوان توصيل بعد. يمكنك إضافة عنوانك لتسهيل عملية الشراء.'
                        : "You haven't saved any delivery address yet. Add one to make checkout faster."}
                    </p>
                    <button
                      onClick={() => {
                        handleTabChange('profile');
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#435849] text-white hover:bg-[#344539] text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'إضافة عنوان جديد' : 'Add Delivery Address'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PASSWORD & SECURITY */}
            {activeTab === 'security' && (
              <div>
                <div className="pb-5 border-b border-[#E8DFD3] mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD3] text-[#435849] flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1E1915] tracking-tight">
                        {locale === 'ar' ? 'كلمة المرور والأمان' : 'Password & Security'}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#7D7065] mt-0.5">
                        {locale === 'ar'
                          ? 'تحديث كلمة المرور الخاصة بحسابك وحماية بياناتك'
                          : 'Update your account password and protect your personal credentials'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Form */}
                  <form onSubmit={handleChangePassword} className="lg:col-span-8 space-y-5">
                    {passwordError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="font-semibold">{passwordError}</span>
                      </div>
                    )}

                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                        {dict.auth.currentPassword || (locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 px-3.5 pe-10 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849] text-start font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8C8075] hover:text-[#201B18] transition-colors p-1"
                          title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8C8075] mt-1">
                        {locale === 'ar'
                          ? 'أدخل كلمة المرور الحالية لتأكيد التغيير'
                          : 'Enter your current password to confirm the change'}
                      </p>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                        {dict.auth.newPassword || (locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password')}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          className="w-full h-11 px-3.5 pe-10 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849] text-start font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8C8075] hover:text-[#201B18] transition-colors p-1"
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8C8075] mt-1">
                        {locale === 'ar'
                          ? 'يجب أن تتكون كلمة المرور من 8 خانات على الأقل'
                          : 'Password must be at least 8 characters long'}
                      </p>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                        {dict.auth.confirmPassword || (locale === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password')}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          className="w-full h-11 px-3.5 pe-10 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] focus:outline-none focus:border-[#435849] text-start font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8C8075] hover:text-[#201B18] transition-colors p-1"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center gap-3 flex-wrap">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isChangingPassword}
                        isLoading={isChangingPassword}
                        className="font-bold text-xs sm:text-sm px-6 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{dict.auth.resetPasswordBtn || (locale === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          handleTabChange('profile');
                        }}
                        className="text-xs sm:text-sm font-semibold text-[#7D7065] cursor-pointer"
                      >
                        <span>{dict.common.close}</span>
                      </Button>
                    </div>
                  </form>

                  {/* Tips Sidebar */}
                  <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E4D8CB] space-y-3">
                    <div className="flex items-center gap-2 text-[#435849] font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{locale === 'ar' ? 'نصائح لحماية الحساب' : 'Security Tips'}</span>
                    </div>
                    <ul className="text-xs text-[#7D7065] space-y-2 list-disc ps-4 leading-relaxed">
                      <li>
                        {locale === 'ar'
                          ? 'استخدم 8 أحرف على الأقل تحتوي على مزيج من الحروف والأرقام.'
                          : 'Use at least 8 characters with a mix of letters and numbers.'}
                      </li>
                      <li>
                        {locale === 'ar'
                          ? 'تجنب استخدام كلمات مرور سهلة التخمين مثل تاريخ الميلاد.'
                          : 'Avoid common patterns or easily guessable dates.'}
                      </li>
                      <li>
                        {locale === 'ar'
                          ? 'لا تشارك بيانات الدخول الخاصة بك مع أي شخص آخر.'
                          : 'Never share your login credentials with anyone.'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ORDER DETAILS MODAL */}
        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (() => {
          const isSelectedUsd = (selectedOrder.currency === 'USD') || (String(selectedOrder.paymentMethod || '').toLowerCase() === 'paypal');
          const modalCurrency: 'SAR' | 'USD' = isSelectedUsd ? 'USD' : 'SAR';
          const modalRate = selectedOrder.exchangeRate || 0.2667;

          const modalTotalUsd = selectedOrder.usdTotal || selectedOrder.currencyAmount || Number((selectedOrder.total * modalRate).toFixed(2));
          const modalTotalSar = selectedOrder.sarTotal || selectedOrder.sarAmount || selectedOrder.total;

          const modalSubtotalSar = selectedOrder.sarSubtotal || selectedOrder.subtotal;
          const modalSubtotalUsd = selectedOrder.usdSubtotal || Number((modalSubtotalSar * modalRate).toFixed(2));

          const modalShippingSar = selectedOrder.sarShippingFee || selectedOrder.shippingFee;
          const modalShippingUsd = selectedOrder.usdShippingFee || Number((modalShippingSar * modalRate).toFixed(2));

          const modalVatSar = selectedOrder.sarVat || selectedOrder.vat;
          const modalVatUsd = selectedOrder.usdVat || Number((modalVatSar * modalRate).toFixed(2));

          const modalDiscountSar = selectedOrder.sarDiscount || selectedOrder.discount;
          const modalDiscountUsd = selectedOrder.usdDiscount || Number((modalDiscountSar * modalRate).toFixed(2));

          const modalDisplayTotal = isSelectedUsd ? modalTotalUsd : modalTotalSar;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl sm:max-w-3xl w-full border border-[#E8DFD3] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-start">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DE]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-[#2D3F33] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-serif font-black text-[#1E1915]">
                          {dict.account.orderDetailsTitle}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-[#FAF7F2] px-2.5 py-0.5 rounded-lg border border-[#E2D8CC] text-[#1E1915]">
                          #{selectedOrder.orderNumber}
                        </span>
                        {isSelectedUsd ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {String(selectedOrder.paymentMethod || '').toLowerCase() === 'paypal' ? 'PayPal (USD)' : `USD • ${formatPaymentMethod(selectedOrder.paymentMethod)}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF7F2] text-[#5C5045] border border-[#E2D8CC]">
                            {formatPaymentMethod(selectedOrder.paymentMethod)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7D7065] mt-0.5 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#8C8075]" />
                        <span>
                          {new Date(selectedOrder.createdAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${backendUrl}/orders/${selectedOrder.orderNumber}/tax-invoice?key=${selectedOrder.orderKey || ''}&print=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#2D3F33] hover:text-[#1E2B23] border border-[#D5C7B5] hover:border-[#2D3F33] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                      title={locale === 'ar' ? 'طباعة / تحميل الفاتورة الضريبية' : 'Download / Print Tax Invoice'}
                    >
                      <FileText className="w-3.5 h-3.5 text-[#8fae2a]" />
                      <span>{locale === 'ar' ? 'تحميل الفاتورة' : 'Invoice'}</span>
                    </a>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#7D7065] hover:text-[#1E1915] flex items-center justify-center transition cursor-pointer border border-[#E8DFD3]"
                      title={dict.common.close}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#8C8075] font-semibold block">{dict.account.orderStatus}</span>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#8C8075] font-semibold block">{locale === 'ar' ? 'حالة السداد' : 'Payment Status'}</span>
                    <div>{getPaymentStatusBadge(selectedOrder.payment_status)}</div>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-[#8C8075] font-semibold block">{locale === 'ar' ? 'وسيلة الدفع' : 'Payment Method'}</span>
                    <span className="font-bold text-[#1E1915] tracking-wide">{formatPaymentMethod(selectedOrder.paymentMethod)}</span>
                  </div>
                </div>

                {/* Unpaid Action Callout Banner */}
                {selectedOrder.payment_status !== 'paid' && selectedOrder.status !== 'cancelled' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs sm:text-sm font-black text-amber-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{locale === 'ar' ? 'هذا الطلب في انتظار السداد' : 'Order is awaiting payment'}</span>
                      </span>
                      <p className="text-xs text-amber-700">
                        {locale === 'ar'
                          ? 'يمكنك سداد الطلب الآن عبر بطاقات مدى، البطاقات الائتمانية، أو تابي بكل سهولة.'
                          : 'Complete your payment securely using Mada, Credit Cards, or Tabby in one click.'}
                      </p>
                    </div>
                    <Link
                      href={locale === 'ar' ? `/order-pay/${selectedOrder.orderNumber}` : `/en/order-pay/${selectedOrder.orderNumber}`}
                      className="px-6 py-2.5 rounded-xl bg-[#8fae2a] hover:bg-[#7d9b23] text-white text-xs font-bold text-center transition shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {locale === 'ar'
                          ? `سداد الآن (${modalDisplayTotal} ${modalCurrency === 'USD' ? 'USD' : 'ر.س'})`
                          : `Pay Now (${modalDisplayTotal} ${modalCurrency})`}
                      </span>
                    </Link>
                  </div>
                )}

                {/* Recipient & Delivery Information - 2 Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Recipient Info */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#EFE8DE] text-[#2D3F33] font-bold uppercase tracking-wider text-[11px]">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>{dict.account.recipientInfo}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#7D7065]">{dict.checkout.recipientName}:</span>
                        <span className="font-bold text-[#1E1915]">{selectedOrder.recipient.name}</span>
                      </div>
                      {selectedOrder.recipient.phone && (
                        <div className="flex justify-between">
                          <span className="text-[#7D7065]">{dict.checkout.recipientPhone}:</span>
                          <span className="font-mono font-semibold text-[#1E1915]" dir="ltr">{selectedOrder.recipient.phone}</span>
                        </div>
                      )}
                      {selectedOrder.recipient.street && (
                        <div className="flex justify-between">
                          <span className="text-[#7D7065]">{locale === 'ar' ? 'العنوان' : 'Address'}:</span>
                          <span className="font-semibold text-[#1E1915] truncate max-w-[180px]">{selectedOrder.recipient.street}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Delivery Details */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#EFE8DE] text-[#2D3F33] font-bold uppercase tracking-wider text-[11px]">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details'}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#7D7065]">{dict.checkout.deliveryCity}:</span>
                        <span className="font-semibold text-[#1E1915]">
                          {selectedOrder.recipient.city} {selectedOrder.recipient.district ? `(${selectedOrder.recipient.district})` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7D7065]">{dict.checkout.deliveryDate}:</span>
                        <span className="font-semibold text-[#1E1915]">{selectedOrder.delivery.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7D7065]">{locale === 'ar' ? 'الفترة' : 'Slot'}:</span>
                        <span className="font-semibold text-[#1E1915]">{formatDeliverySlot(selectedOrder.delivery.timeSlot)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gift Card & Dedication Details (if present) */}
                {(selectedOrder.giftCard?.message || selectedOrder.giftCard?.senderName || selectedOrder.giftCard?.songLink || selectedOrder.songLink) && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#EFE8DE] text-[#2D3F33] font-bold uppercase tracking-wider text-[11px]">
                      <Gift className="w-3.5 h-3.5 text-[#435849]" />
                      <span>{locale === 'ar' ? 'تفاصيل بطاقة الإهداء' : 'Gift Card & Dedication Details'}</span>
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.giftCard?.senderName && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#7D7065]">{locale === 'ar' ? 'اسم المرسل على البطاقة:' : 'Sender Name on Card:'}</span>
                          <span className="font-semibold text-[#1E1915]">{selectedOrder.giftCard.senderName}</span>
                        </div>
                      )}
                      {selectedOrder.giftCard?.message && (
                        <div className="space-y-1">
                          <span className="text-[#7D7065] block">{locale === 'ar' ? 'رسالة الإهداء:' : 'Card Message:'}</span>
                          <div className="p-3 bg-white rounded-xl border border-[#EFE8DE] italic text-[#1E1915] leading-relaxed">
                            "{selectedOrder.giftCard.message}"
                          </div>
                        </div>
                      )}
                      {(selectedOrder.giftCard?.songLink || selectedOrder.songLink) && (
                        <div className="flex justify-between items-center gap-2 pt-1 border-t border-[#EFE8DE]/60">
                          <span className="text-[#7D7065] flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5 text-[#435849]" />
                            <span>{locale === 'ar' ? 'رابط الأغنية / الإهداء:' : 'Dedication Song Link:'}</span>
                          </span>
                          <a
                            href={selectedOrder.giftCard?.songLink || selectedOrder.songLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#435849] hover:underline font-bold text-xs truncate max-w-[220px]"
                          >
                            {locale === 'ar' ? 'تشغيل الأغنية' : 'Listen to Song'} ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2.5">
                  <span className="font-bold text-[#1E1915] block uppercase tracking-wider text-[11px]">
                    {dict.account.orderItems} ({selectedOrder.items.length})
                  </span>
                  <div className="divide-y divide-[#EFE8DE] border border-[#E8DFD3] rounded-2xl overflow-hidden bg-white">
                    {selectedOrder.items.map((item, i) => {
                      const itemSar = item.itemTotal;
                      const itemDisplayPrice = isSelectedUsd ? Number((itemSar * modalRate).toFixed(2)) : itemSar;
                      return (
                        <div key={i} className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-[#FAF7F2]/40 transition">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3] shrink-0">
                              {item.product.thumbnail ? (
                                <Image
                                  src={formatStorageUrl(item.product.thumbnail)}
                                  alt={item.product.name[locale]}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#8C8075]">
                                  <Package className="w-5 h-5 opacity-40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8C8075] uppercase tracking-wider block mb-0.5">
                                {item.product.category?.[locale] || (locale === 'ar' ? 'زهور فاخرة' : 'Floral Arrangement')}
                              </span>
                              <span className="font-bold text-[#1E1915] block truncate mb-1">
                                {item.product.name[locale]}
                              </span>
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF7F2] text-[11px] font-semibold text-[#5C5045] border border-[#E8DFD3]">
                                {dict.product.quantity}: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-end shrink-0">
                            <span dir="ltr" className="font-bold text-[#1E1915] inline-flex items-center gap-1">
                              <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={modalCurrency} />
                              <span>{itemDisplayPrice}</span>
                            </span>
                            {isSelectedUsd && (
                              <div className="text-[10px] text-[#8C8075] font-semibold flex items-center justify-end gap-0.5 mt-0.5" dir="ltr">
                                <span>(</span>
                                <CurrencySymbol forcedCurrency="SAR" size={10} className="w-2.5 h-2.5 inline -mt-0.5" />
                                <span>{itemSar})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Breakdown & Total */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2 text-xs">
                  <div className="flex justify-between text-[#7D7065]">
                    <span>{dict.cart.subtotal}:</span>
                    <div className="text-end">
                      <span dir="ltr" className="font-semibold text-[#1E1915] inline-flex items-center gap-1">
                        <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={modalCurrency} />
                        <span>{isSelectedUsd ? modalSubtotalUsd : modalSubtotalSar}</span>
                      </span>
                      {isSelectedUsd && (
                        <span className="text-[11px] text-[#8C8075] ms-1.5 inline-flex items-center gap-0.5 font-semibold" dir="ltr">
                          <span>(</span>
                          <CurrencySymbol forcedCurrency="SAR" size={11} className="w-3 h-3 inline -mt-0.5" />
                          <span>{modalSubtotalSar})</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {modalShippingSar > 0 && (
                    <div className="flex justify-between text-[#7D7065]">
                      <span>{getShippingLabel(selectedOrder)}:</span>
                      <div className="text-end">
                        <span dir="ltr" className="font-semibold text-[#1E1915] inline-flex items-center gap-1">
                          <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={modalCurrency} />
                          <span>{isSelectedUsd ? modalShippingUsd : modalShippingSar}</span>
                        </span>
                        {isSelectedUsd && (
                          <span className="text-[11px] text-[#8C8075] ms-1.5 inline-flex items-center gap-0.5 font-semibold" dir="ltr">
                            <span>(</span>
                            <CurrencySymbol forcedCurrency="SAR" size={11} className="w-3 h-3 inline -mt-0.5" />
                            <span>{modalShippingSar})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {modalVatSar > 0 && (
                    <div className="flex justify-between text-[#7D7065]">
                      <span>{vatLabel}:</span>
                      <div className="text-end">
                        <span dir="ltr" className="font-semibold text-[#1E1915] inline-flex items-center gap-1">
                          <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={modalCurrency} />
                          <span>{isSelectedUsd ? modalVatUsd : modalVatSar}</span>
                        </span>
                        {isSelectedUsd && (
                          <span className="text-[11px] text-[#8C8075] ms-1.5 inline-flex items-center gap-0.5 font-semibold" dir="ltr">
                            <span>(</span>
                            <CurrencySymbol forcedCurrency="SAR" size={11} className="w-3 h-3 inline -mt-0.5" />
                            <span>{modalVatSar})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {modalDiscountSar > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{dict.cart.discount}:</span>
                      <div className="text-end">
                        <span dir="ltr" className="inline-flex items-center gap-1">
                          <span>-</span>
                          <CurrencySymbol className="w-3.5 h-3.5 text-emerald-600" forcedCurrency={modalCurrency} />
                          <span>{isSelectedUsd ? modalDiscountUsd : modalDiscountSar}</span>
                        </span>
                        {isSelectedUsd && (
                          <span className="text-[11px] text-emerald-700/80 ms-1.5 inline-flex items-center gap-0.5 font-semibold" dir="ltr">
                            <span>(-</span>
                            <CurrencySymbol forcedCurrency="SAR" size={11} className="w-3 h-3 inline -mt-0.5" />
                            <span>{modalDiscountSar})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-[#E8DFD3] text-sm sm:text-base font-black text-[#1E1915]">
                    <span>{dict.cart.total}:</span>
                    <div className="text-end">
                      <span dir="ltr" className="text-base sm:text-lg text-[#2D3F33] flex items-center justify-end gap-1 font-black">
                        <CurrencySymbol className="w-4 h-4" forcedCurrency={modalCurrency} />
                        <span>{modalDisplayTotal}</span>
                      </span>
                      {isSelectedUsd ? (
                        <div className="text-xs text-[#7D7065] font-semibold mt-0.5 flex items-center justify-end gap-1" dir="ltr">
                          <span>Base Amount:</span>
                          <CurrencySymbol forcedCurrency="SAR" size={12} className="w-3 h-3 inline -mt-0.5" />
                          <span>{modalTotalSar}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#8C8075] font-medium mt-0.5 flex items-center justify-end gap-1" dir="ltr">
                          <span>≈</span>
                          <CurrencySymbol forcedCurrency="USD" className="text-[#8fae2a]" />
                          <span>{(modalTotalSar * modalRate).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export function AccountPageView(props: AccountPageViewProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#435849] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AccountPageContent {...props} />
    </Suspense>
  );
}
