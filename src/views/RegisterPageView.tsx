'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useMergeCartMutation, getCartSessionId, convertServerCartItemToClient } from '@/store/api/cartApi';
import { setCartFromServer } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  AlertCircle,
} from 'lucide-react';

interface RegisterPageViewProps {
  locale: Locale;
}

function getLocalizedRedirectUrl(raw: string | null, targetLocale: Locale): string {
  if (!raw) return targetLocale === 'ar' ? '/account' : '/en/account';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
    return targetLocale === 'ar' ? '/account' : '/en/account';
  }
  let path = raw.startsWith('/') ? raw : `/${raw}`;
  if (targetLocale === 'en') {
    if (!path.startsWith('/en')) {
      path = path === '/' ? '/en' : `/en${path}`;
    }
  } else {
    if (path === '/en') {
      path = '/';
    } else if (path.startsWith('/en/')) {
      path = path.replace(/^\/en/, '');
    }
  }
  return path;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function parseRegisterError(err: any, currentLocale: Locale): { bannerMsg: string; fieldErrors: FieldErrors } {
  const isAr = currentLocale === 'ar';
  const data = err?.data || err?.response?.data || err;
  const fieldErrors: FieldErrors = {};
  let bannerMsg = isAr ? 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.' : 'Error creating account. Please try again.';

  // Case 1: Structured validation errors object
  if (data?.errors && typeof data.errors === 'object') {
    const raw = data.errors;
    if (raw.email) {
      const msg = Array.isArray(raw.email) ? raw.email[0] : String(raw.email);
      const emailErr = msg.toLowerCase().includes('taken')
        ? (isAr ? 'البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.' : 'The email has already been taken.')
        : msg;
      fieldErrors.email = emailErr;
      bannerMsg = emailErr;
    }
    if (raw.phone) {
      const msg = Array.isArray(raw.phone) ? raw.phone[0] : String(raw.phone);
      const phoneErr = isAr ? 'رقم الجوال مسجل بالفعل أو غير صالح.' : msg;
      fieldErrors.phone = phoneErr;
      if (!bannerMsg || bannerMsg.includes('حدث خطأ') || bannerMsg.includes('Error')) bannerMsg = phoneErr;
    }
    if (raw.first_name) {
      const firstErr = Array.isArray(raw.first_name) ? raw.first_name[0] : String(raw.first_name);
      fieldErrors.firstName = firstErr;
      if (!bannerMsg || bannerMsg.includes('حدث خطأ') || bannerMsg.includes('Error')) bannerMsg = firstErr;
    }
    if (raw.last_name) {
      const lastErr = Array.isArray(raw.last_name) ? raw.last_name[0] : String(raw.last_name);
      fieldErrors.lastName = lastErr;
      if (!bannerMsg || bannerMsg.includes('حدث خطأ') || bannerMsg.includes('Error')) bannerMsg = lastErr;
    }
    if (raw.password) {
      const msg = Array.isArray(raw.password) ? raw.password[0] : String(raw.password);
      const pwdErr = isAr ? 'يجب ألا تقل كلمة المرور عن 8 خانات.' : msg;
      fieldErrors.password = pwdErr;
      if (!bannerMsg || bannerMsg.includes('حدث خطأ') || bannerMsg.includes('Error')) bannerMsg = pwdErr;
    }
    return { bannerMsg, fieldErrors };
  }

  // Case 2: Direct error string: { error: "The email has already been taken." }
  const rawError = typeof data?.error === 'string' ? data.error : typeof data?.message === 'string' ? data.message : '';

  if (rawError) {
    const lower = rawError.toLowerCase();
    if (lower.includes('email') && (lower.includes('taken') || lower.includes('unique') || lower.includes('exists'))) {
      const emailMsg = isAr
        ? 'البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.'
        : 'The email has already been taken.';
      fieldErrors.email = emailMsg;
      bannerMsg = emailMsg;
    } else if (lower.includes('phone') || lower.includes('mobile')) {
      const phoneMsg = isAr
        ? 'يرجى إدخال رقم جوال صحيح (مثال: 501234567).'
        : rawError;
      fieldErrors.phone = phoneMsg;
      bannerMsg = phoneMsg;
    } else if (lower.includes('password')) {
      const pwdMsg = isAr
        ? 'يجب ألا تقل كلمة المرور عن 8 خانات.'
        : rawError;
      fieldErrors.password = pwdMsg;
      bannerMsg = pwdMsg;
    } else {
      bannerMsg = rawError;
    }
  }

  return { bannerMsg, fieldErrors };
}

function RegisterPageContent({ locale }: RegisterPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = getLocalizedRedirectUrl(rawRedirect, locale);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [mergeCart] = useMergeCartMutation();
  const localCartItems = useAppSelector((state) => state.cart.items);

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clientErrors: FieldErrors = {};

    if (!firstName.trim()) {
      clientErrors.firstName = locale === 'ar' ? 'يرجى إدخال الاسم الأول' : 'Please enter your first name.';
    } else if (firstName.trim().length < 2) {
      clientErrors.firstName = locale === 'ar' ? 'يجب ألا يقل الاسم الأول عن حرفين' : 'First name must be at least 2 characters.';
    }

    if (!lastName.trim()) {
      clientErrors.lastName = locale === 'ar' ? 'يرجى إدخال اسم العائلة' : 'Please enter your last name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      clientErrors.email = locale === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address.';
    } else if (!emailRegex.test(email.trim())) {
      clientErrors.email = locale === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Please enter a valid email address.';
    }

    if (phone.trim()) {
      const digits = phone.trim().replace(/\D/g, '');
      const national = digits.startsWith('0') ? digits.substring(1) : digits;
      if (national.length !== 9 || !national.startsWith('5')) {
        clientErrors.phone = locale === 'ar'
          ? 'رقم الجوال يجب أن يتكون من 9 أرقام ويبدأ بـ 5 (مثال: 501234567)'
          : 'Mobile number must be 9 digits starting with 5 (e.g. 501234567).';
      }
    }

    if (!password) {
      clientErrors.password = locale === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter a password.';
    } else if (password.length < 8) {
      clientErrors.password = locale === 'ar' ? 'يجب ألا تقل كلمة المرور عن 8 خانات' : 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      clientErrors.confirmPassword = locale === 'ar' ? 'يرجى تأكيد كلمة المرور' : 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      clientErrors.confirmPassword = locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match.';
    }

    if (!agreeTerms) {
      clientErrors.terms = locale === 'ar'
        ? 'يرجى الموافقة على الشروط والأحكام للمتابعة'
        : 'Please agree to terms and privacy policy to continue.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const firstError = Object.values(clientErrors)[0];
      setErrorMsg(firstError);
      return;
    }

    const cleanDigits = phone.trim().replace(/\D/g, '');
    const nationalDigits = cleanDigits.startsWith('0') ? cleanDigits.substring(1) : cleanDigits;
    const formattedPhone = nationalDigits ? `+966${nationalDigits}` : undefined;

    try {
      const response = await registerMutation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: formattedPhone,
        password,
      }).unwrap();

      dispatch(setCredentials({ user: response.user, token: response.token }));

      // 1. Instant feedback & redirect (0ms delay)
      dispatch(
        addToast({
          type: 'success',
          message: dict.auth.registerSuccess,
        })
      );
      router.push(redirectUrl);

      // 2. Background Smart Cart Merge on Register (Non-blocking)
      const payloadItems = localCartItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));
      mergeCart({
        guest_session_id: getCartSessionId(),
        local_items: payloadItems,
      })
        .unwrap()
        .then((mergeRes) => {
          if (mergeRes?.items) {
            const clientItems = mergeRes.items.map(convertServerCartItemToClient);
            dispatch(setCartFromServer(clientItems));
          }
        })
        .catch((mergeErr) => {
          console.warn('[Cart Background Merge Notice]', mergeErr);
        });
    } catch (err: any) {
      console.warn('[Register Error]', err);
      const { bannerMsg, fieldErrors: serverFieldErrors } = parseRegisterError(err, locale);
      setErrorMsg(bannerMsg);
      setFieldErrors(serverFieldErrors);
    }
  };

  const loginUrl =
    locale === 'ar'
      ? `/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
      : `/en/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;

  return (
    <div className="min-h-[85vh] py-10 sm:py-16 bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2D3F33]/[0.03] blur-3xl pointer-events-none" />

      {/* Main Single Centered Card */}
      <div className="w-full max-w-[550px] bg-[#FDFBF7] rounded-[28px] sm:rounded-[32px] border border-[#EFE8DE] shadow-[0_12px_45px_-12px_rgba(45,36,28,0.07)] p-7 sm:p-10 relative z-10 text-start">
        
        {/* Top Centered Switch Pill Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 bg-[#F4ECE1]/70 rounded-full border border-[#E7DDD0] w-full max-w-[320px]">
            <Link
              href={loginUrl}
              className="flex-1 text-center py-2 rounded-full font-semibold text-xs text-[#5C5045] hover:text-[#1E1915] transition-colors"
            >
              {dict.auth.signIn}
            </Link>
            <span className="flex-1 text-center py-2 rounded-full bg-[#2D3F33] text-white font-bold text-xs shadow-xs transition-all">
              {dict.auth.createAccount}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl sm:text-[34px] font-serif font-black text-[#1E1915] tracking-tight leading-tight">
            {dict.auth.createAccount}
          </h1>
          <p className="text-sm sm:text-base text-[#7D7065] mt-1.5 leading-relaxed">
            {dict.auth.registerSubtitle}
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-start">
              <p className="font-bold text-rose-900 leading-snug">{errorMsg}</p>
              {fieldErrors.email && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center gap-1.5 text-xs">
                  <span className="text-rose-700">
                    {locale === 'ar' ? 'هل لديك حساب بالفعل؟' : 'Already have an account?'}
                  </span>
                  <Link
                    href={loginUrl}
                    className="font-bold text-rose-900 underline hover:text-rose-950 transition-colors"
                  >
                    {dict.auth.signIn}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          {/* First Name & Last Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.firstName} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearFieldError('firstName');
                  }}
                  placeholder={dict.auth.firstNamePlaceholder}
                  className={`w-full h-12 px-4 ps-11 text-xs sm:text-sm border rounded-2xl placeholder:text-[#A6998E] focus:outline-none transition-all ${
                    fieldErrors.firstName
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                      : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                  }`}
                />
                <User className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              </div>
              {fieldErrors.firstName && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.firstName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.lastName} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError('lastName');
                  }}
                  placeholder={dict.auth.lastNamePlaceholder}
                  className={`w-full h-12 px-4 ps-11 text-xs sm:text-sm border rounded-2xl placeholder:text-[#A6998E] focus:outline-none transition-all ${
                    fieldErrors.lastName
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                      : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                  }`}
                />
                <User className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              </div>
              {fieldErrors.lastName && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.lastName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.email} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder={dict.auth.emailPlaceholder}
                  className={`w-full h-12 px-4 ps-11 text-xs sm:text-sm border rounded-2xl placeholder:text-[#A6998E] focus:outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                      : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                  }`}
                />
                <Mail className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.phone} <span className="text-text-muted font-normal text-[11px]">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
              </label>
              <div dir="ltr" className="flex items-center">
                {/* Fixed Saudi Arabia Country Code */}
                <div
                  title="Saudi Arabia (+966)"
                  className={`h-12 px-3 border border-r-0 rounded-l-2xl flex items-center gap-1.5 text-xs sm:text-sm font-bold select-none shrink-0 ${
                    fieldErrors.phone
                      ? 'bg-rose-50 border-rose-400 text-rose-900'
                      : 'bg-[#F0EBE1] border-[#E2D8CC] text-[#2D3F33]'
                  }`}
                >
                  <img
                    src="https://flagicons.lipis.dev/flags/4x3/sa.svg"
                    alt="Saudi Arabia"
                    className="w-5 h-3.5 object-cover rounded-xs border border-gray-200/80 shadow-2xs inline-block"
                    loading="lazy"
                  />
                  <span className="font-mono font-bold text-xs sm:text-sm">+966</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      clearFieldError('phone');
                    }}
                    placeholder="501234567"
                    className={`w-full h-12 px-4 ps-11 text-xs sm:text-sm border rounded-r-2xl placeholder:text-[#A6998E] focus:outline-none transition-all text-left ${
                      fieldErrors.phone
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                        : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-[#8C8075] absolute left-4 top-4 pointer-events-none" />
                </div>
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.password} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder={dict.auth.passwordPlaceholder}
                  className={`w-full h-12 px-4 ps-11 pe-10 text-xs sm:text-sm border rounded-2xl placeholder:text-[#A6998E] focus:outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                      : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                  }`}
                />
                <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-4 text-[#8C8075] hover:text-[#1E1915] transition-colors cursor-pointer"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.confirmPassword} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  placeholder={dict.auth.confirmPasswordPlaceholder}
                  className={`w-full h-12 px-4 ps-11 pe-10 text-xs sm:text-sm border rounded-2xl placeholder:text-[#A6998E] focus:outline-none transition-all ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-rose-950'
                      : 'border-[#E2D8CC] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white text-[#1E1915]'
                  }`}
                />
                <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-3.5 top-4 text-[#8C8075] hover:text-[#1E1915] transition-colors cursor-pointer"
                  aria-label="Toggle confirm password"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#5C5045] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  clearFieldError('terms');
                }}
                className={`w-4 h-4 mt-0.5 rounded cursor-pointer shrink-0 ${
                  fieldErrors.terms
                    ? 'border-rose-500 text-rose-600 focus:ring-rose-400'
                    : 'text-[#2D3F33] border-[#D5C6B5] focus:ring-[#2D3F33]'
                }`}
              />
              <span className="leading-relaxed">{dict.auth.termsAgreement}</span>
            </label>
            {fieldErrors.terms && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.terms}</span>
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full h-12 rounded-full bg-[#2D3F33] hover:bg-[#202E25] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 mt-2 flex items-center justify-center gap-2"
          >
            <span>{dict.auth.createAccount}</span>
            <ArrowIcon className="w-4 h-4 ms-1" />
          </Button>
        </form>

        {/* Botanical Leaf Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAE1D5]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FDFBF7] px-3 text-[#9A8D80]">
              <Leaf className="w-4 h-4 rotate-45 text-[#8C7E72]" />
            </span>
          </div>
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-xs sm:text-[13px] text-[#7D7065]">
            {dict.auth.alreadyHaveAccount}{' '}
            <Link
              href={loginUrl}
              className="font-bold text-[#1E1915] hover:text-[#2D3F33] hover:underline transition-colors"
            >
              {dict.auth.signIn}
            </Link>
          </p>
        </div>

        {/* Trust Badges Footer */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#9A8D80]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D3F33]" />
          <span>{locale === 'ar' ? 'حسابك آمن ومحمي بنظام تشفير كامل' : '256-bit SSL Encrypted & Protected'}</span>
        </div>
      </div>
    </div>
  );
}

export function RegisterPageView(props: RegisterPageViewProps) {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-[#FAF7F2]" />}>
      <RegisterPageContent {...props} />
    </Suspense>
  );
}
