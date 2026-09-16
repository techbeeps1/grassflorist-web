'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Leaf,
} from 'lucide-react';

interface LoginPageViewProps {
  locale: Locale;
}

function LoginPageContent({ locale }: LoginPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const redirectUrl = searchParams.get('redirect') || (locale === 'ar' ? '/account' : '/en/account');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [loginMutation, { isLoading }] = useLoginMutation();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(dict.validation.required);
      return;
    }

    try {
      const response = await loginMutation({ email, password, rememberMe }).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.token, rememberMe }));
      dispatch(
        addToast({
          type: 'success',
          message: dict.auth.loginSuccess,
        })
      );
      router.push(redirectUrl);
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Invalid email or password'
      );
    }
  };

  const registerUrl =
    locale === 'ar'
      ? `/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
      : `/en/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;

  return (
    <div className="min-h-[85vh] py-10 sm:py-16 bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2D3F33]/[0.03] blur-3xl pointer-events-none" />

      {/* Main Single Centered Card */}
      <div className="w-full max-w-[550px] bg-[#FDFBF7] rounded-[28px] sm:rounded-[32px] border border-[#EFE8DE] shadow-[0_12px_45px_-12px_rgba(45,36,28,0.07)] p-7 sm:p-10 relative z-10 text-start">
        
        {/* Top Centered Switch Pill Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 bg-[#F4ECE1]/70 rounded-full border border-[#E7DDD0] w-full max-w-[320px]">
            <span className="flex-1 text-center py-2 rounded-full bg-[#2D3F33] text-white font-bold text-xs shadow-xs transition-all">
              {dict.auth.signIn}
            </span>
            <Link
              href={registerUrl}
              className="flex-1 text-center py-2 rounded-full font-semibold text-xs text-[#5C5045] hover:text-[#1E1915] transition-colors"
            >
              {dict.auth.createAccount}
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl sm:text-[34px] font-serif font-black text-[#1E1915] tracking-tight leading-tight">
            {dict.auth.signIn}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5 leading-relaxed">
            {locale === 'ar'
              ? 'أهلاً بك مجدداً في بوتيك جراس للزهور الفاخرة'
              : 'Welcome back to Grass Luxury Floral Boutique'}
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#1E1915]">
                {dict.auth.password} <span className="text-rose-500">*</span>
              </label>
              <Link
                href={locale === 'ar' ? '/forgot-password' : '/en/forgot-password'}
                className="text-xs font-semibold text-[#5C5045] hover:text-[#2D3F33] hover:underline transition-colors"
              >
                {dict.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.auth.passwordPlaceholder}
                className="w-full h-12 px-4 ps-11 pe-11 text-xs sm:text-sm bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E2D8CC] rounded-2xl text-[#1E1915] placeholder:text-[#A6998E] focus:outline-none focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/10 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-4 text-[#8C8075] hover:text-[#1E1915] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="pt-0.5">
            <label className="flex items-center gap-2.5 text-xs font-medium text-[#4A4036] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2D3F33] border-[#D5C6B5] focus:ring-[#2D3F33] cursor-pointer"
              />
              <span>{dict.auth.rememberMe}</span>
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
            <span>{dict.auth.signIn}</span>
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

        {/* Bottom Switch Account Link */}
        <div className="text-center">
          <p className="text-xs sm:text-[13px] text-[#7D7065]">
            {dict.auth.dontHaveAccount}{' '}
            <Link
              href={registerUrl}
              className="font-bold text-[#1E1915] hover:text-[#2D3F33] hover:underline transition-colors"
            >
              {dict.auth.createAccount}
            </Link>
          </p>
        </div>

        {/* Trust Badges Footer */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#9A8D80]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D3F33]" />
          <span>{locale === 'ar' ? 'بياناتك مشفرة ومحمية بأعلى معايير الأمان' : '256-bit SSL Encrypted & Protected'}</span>
        </div>
      </div>
    </div>
  );
}

export function LoginPageView(props: LoginPageViewProps) {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-[#FAF7F2]" />}>
      <LoginPageContent {...props} />
    </Suspense>
  );
}
