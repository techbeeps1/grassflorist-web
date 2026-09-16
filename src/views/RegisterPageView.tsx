'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
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
} from 'lucide-react';

interface RegisterPageViewProps {
  locale: Locale;
}

function RegisterPageContent({ locale }: RegisterPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const redirectUrl = searchParams.get('redirect') || (locale === 'ar' ? '/account' : '/en/account');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [registerMutation, { isLoading }] = useRegisterMutation();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg(dict.validation.required);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(dict.auth.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(dict.auth.passwordMismatch);
      return;
    }

    if (!agreeTerms) {
      setErrorMsg(
        locale === 'ar'
          ? 'يرجى الموافقة على الشروط والأحكام للمتابعة'
          : 'Please agree to terms and privacy policy'
      );
      return;
    }

    try {
      const response = await registerMutation({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      }).unwrap();

      dispatch(setCredentials({ user: response.user, token: response.token }));
      dispatch(
        addToast({
          type: 'success',
          message: dict.auth.registerSuccess,
        })
      );
      router.push(redirectUrl);
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
          : 'Error creating account. Please try again.'
      );
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
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5 leading-relaxed">
            {dict.auth.registerSubtitle}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#1E1915] mb-2">
              {dict.auth.name} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dict.auth.namePlaceholder}
                className="w-full h-12 px-4 ps-11 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.auth.emailPlaceholder}
                  className="w-full h-12 px-4 ps-11 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all"
                />
                <Mail className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1915] mb-2">
                {dict.auth.phone} <span className="text-text-muted font-normal text-[11px]">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={dict.auth.phonePlaceholder}
                  dir="ltr"
                  className="w-full h-12 px-4 ps-11 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all text-start"
                />
                <Phone className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={dict.auth.passwordPlaceholder}
                  className="w-full h-12 px-4 ps-11 pe-10 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all"
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={dict.auth.confirmPasswordPlaceholder}
                  className="w-full h-12 px-4 ps-11 pe-10 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all"
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
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#5C5045] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#2D3F33] border-[#D5C6B5] focus:ring-[#2D3F33] cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">{dict.auth.termsAgreement}</span>
            </label>
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
