'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Heart,
  Truck,
  Gift,
  CheckCircle2,
  Zap,
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

  const handleDemoLogin = async () => {
    setEmail('sara@example.com');
    setPassword('password123');
    setErrorMsg(null);
    try {
      const response = await loginMutation({
        email: 'sara@example.com',
        password: 'password123',
        rememberMe: true,
      }).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.token, rememberMe: true }));
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
          ? 'تعذر تسجيل الدخول بالحساب التجريبي'
          : 'Demo login failed'
      );
    }
  };

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.auth.signIn },
  ];

  return (
    <div className="min-h-[85vh] py-8 sm:py-14 bg-gradient-to-b from-[#FAF7F2] via-[#F6F0E6] to-[#FAF7F2] relative overflow-hidden">
      {/* Delicate background ambient glows */}
      <div className="absolute top-10 start-10 w-72 h-72 rounded-full bg-[#435849]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-10 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

      <div className="site-container max-w-5xl mx-auto relative z-10">
        <Breadcrumbs items={breadcrumbs} locale={locale} className="mb-6 justify-center sm:justify-start" />

        {/* Main Card Container with Two-Column Split on Desktop */}
        <div className="bg-white rounded-[2rem] border border-[#E9DFD3] shadow-[0_20px_60px_-15px_rgba(32,27,24,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left / Editorial Branding Column (Visible on Desktop, compact banner on Mobile) */}
          <div className="lg:col-span-5 bg-[#435849] text-white p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
            {/* Background luxury photo with rich overlay */}
            <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
              <Image
                src="/editorial-woman-bouquet.webp"
                alt="Grass Florist Moments"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C3B30] via-[#435849]/90 to-[#435849]/70 z-0" />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-white/95 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>{locale === 'ar' ? 'بوتيك جراس للزهور الفاخرة' : 'Grass Luxury Florist Atelier'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
                {locale === 'ar' ? (
                  <>
                    أهلاً بك في عالم <span className="text-[#E6C687] italic font-serif">الجمال والأناقة</span>
                  </>
                ) : (
                  <>
                    Welcome to <span className="text-[#E6C687] italic font-serif">Artisanal Floristry</span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm">
                {locale === 'ar'
                  ? 'سجّل دخولك لمتابعة طلباتك، حفظ عناوينك وتفضيلاتك المفضلة، واستمتع بتجربة تسوق فريدة.'
                  : 'Sign in to track your orders, manage saved delivery addresses, and enjoy bespoke floral experiences.'}
              </p>
            </div>

            {/* Features List */}
            <div className="relative z-10 my-8 space-y-4 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Truck className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'توصيل سريع ونفس اليوم بسيارات مبردة' : 'Same-day express temperature-controlled delivery'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Heart className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'زهور طازجة منتقاة يدوياً بأعلى معايير الجودة' : '100% Handpicked fresh blooms & luxury vases'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Gift className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'كروت إهداء مجانية مع تغليف فاخر مخصص' : 'Complimentary greeting cards & bespoke gift packaging'}</span>
              </div>
            </div>

            {/* Bottom Quote & Trust */}
            <div className="relative z-10 pt-4 text-[11px] text-white/60 flex items-center justify-between">
              <span>{locale === 'ar' ? 'جراس فلوريست © 2026' : 'Grass Florist © 2026'}</span>
              <div className="flex items-center gap-1 text-[#E6C687]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'بوابة آمنة 100%' : '100% Secure Portal'}</span>
              </div>
            </div>
          </div>

          {/* Right / Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Quick Switch Tabs */}
            <div className="flex items-center p-1 bg-[#FAF7F2] rounded-2xl border border-[#EBE2D7] mb-8 max-w-sm mx-auto w-full">
              <span className="flex-1 text-center py-2.5 rounded-xl bg-white font-bold text-xs sm:text-sm text-[#435849] shadow-sm">
                {dict.auth.signIn}
              </span>
              <Link
                href={
                  locale === 'ar'
                    ? `/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                    : `/en/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                }
                className="flex-1 text-center py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#7D7065] hover:text-[#201B18] transition-colors"
              >
                {dict.auth.createAccount}
              </Link>
            </div>

            {/* Form Header */}
            <div className="mb-6 text-start">
              <h1 className="text-2xl sm:text-3xl font-black text-[#201B18] tracking-tight">
                {dict.auth.loginTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5">
                {dict.auth.loginSubtitle}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Fast Demo Account Helper Banner */}
            <div className="mb-6 p-3.5 rounded-2xl bg-[#F8F5EE] border border-[#E4D8CB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#435849]/10 text-[#435849] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-[#201B18]">
                    {locale === 'ar' ? 'تسجيل دخول تجريبي سريع' : 'Fast Demo Login'}
                  </div>
                  <div className="text-[11px] text-[#7D7065]">sara@example.com</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="px-3 py-1.5 rounded-xl bg-[#435849] hover:bg-[#344539] text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              >
                {locale === 'ar' ? 'تجربة الآن' : 'Try Demo'}
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5 text-start">
              <div>
                <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                  {dict.auth.email} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.auth.emailPlaceholder}
                    className="w-full h-12 px-4 ps-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#201B18]">
                    {dict.auth.password} <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    href={locale === 'ar' ? '/forgot-password' : '/en/forgot-password'}
                    className="text-xs font-bold text-[#435849] hover:text-[#2E3C32] hover:underline"
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
                    className="w-full h-12 px-4 ps-11 pe-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-4 text-[#8C8075] hover:text-[#201B18] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-xs text-[#5C524B] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#435849] border-[#D5C6B5] focus:ring-[#435849] cursor-pointer"
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
                className="w-full h-12 font-bold text-sm shadow-md hover:shadow-xl mt-3 transition-all rounded-xl"
              >
                <span>{dict.auth.signIn}</span>
                <ArrowIcon className="w-4 h-4 ms-2" />
              </Button>
            </form>

            {/* Bottom Register Switch */}
            <div className="mt-8 pt-6 border-t border-[#EAE1D7] text-center">
              <p className="text-xs sm:text-sm text-[#7D7065]">
                {dict.auth.dontHaveAccount}{' '}
                <Link
                  href={
                    locale === 'ar'
                      ? `/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                      : `/en/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                  }
                  className="font-bold text-[#435849] hover:underline"
                >
                  {dict.auth.createAccount}
                </Link>
              </p>
            </div>

            {/* Trust badges footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#8C8075]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#435849]" />
              <span>{locale === 'ar' ? 'بياناتك مشفرة ومحمية بأعلى معايير الأمان' : '256-bit SSL Encrypted & Protected'}</span>
            </div>
          </div>
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
