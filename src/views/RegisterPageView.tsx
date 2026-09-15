'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
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
} from 'lucide-react';

interface RegisterPageViewProps {
  locale: Locale;
}

export function RegisterPageView({ locale }: RegisterPageViewProps) {
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

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.auth.signUp },
  ];

  return (
    <div className="min-h-[85vh] py-8 sm:py-14 bg-gradient-to-b from-[#FAF7F2] via-[#F6F0E6] to-[#FAF7F2] relative overflow-hidden">
      {/* Delicate background ambient glows */}
      <div className="absolute top-10 start-10 w-72 h-72 rounded-full bg-[#435849]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-10 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

      <div className="site-container max-w-5xl mx-auto relative z-10">
        <Breadcrumbs items={breadcrumbs} locale={locale} className="mb-6 justify-center sm:justify-start" />

        {/* Main Split Container */}
        <div className="bg-white rounded-[2rem] border border-[#E9DFD3] shadow-[0_20px_60px_-15px_rgba(32,27,24,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left / Editorial Branding Column */}
          <div className="lg:col-span-5 bg-[#435849] text-white p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
            {/* Background photo */}
            <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
              <Image
                src="/editorial-flowers-sharp.webp"
                alt="Grass Florist Garden"
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
                <span>{locale === 'ar' ? 'انضم إلى عائلة جراس فلوريست' : 'Join Grass Florist Atelier'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
                {locale === 'ar' ? (
                  <>
                    عضوية حصرية <span className="text-[#E6C687] italic font-serif">وتجربة فاخرة</span>
                  </>
                ) : (
                  <>
                    Exclusive Membership <span className="text-[#E6C687] italic font-serif">& Floral Privileges</span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm">
                {locale === 'ar'
                  ? 'أنشئ حسابك الجديد للاستمتاع بعروض حصرية، إعادة الطلب بنقرة واحدة وتوصيل مجدول في المناسبات السعيدة.'
                  : 'Create your account to unlock private collections, fast re-ordering, and scheduled surprise deliveries.'}
              </p>
            </div>

            {/* Benefits List */}
            <div className="relative z-10 my-8 space-y-4 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Sparkles className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'نقاط ومكافآت حصرية مع كل طلب' : 'Exclusive reward points & luxury gifts with every order'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Gift className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'تذكير ذكي بمناسباتك السنوية وأعياد الميلاد' : 'Smart annual occasion reminders for your loved ones'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Truck className="w-4 h-4 text-[#E6C687]" />
                </div>
                <span>{locale === 'ar' ? 'أولوية التوصيل في أوقات الذروة والمواسم' : 'Priority delivery scheduling during peak seasons'}</span>
              </div>
            </div>

            {/* Bottom Quote & Trust */}
            <div className="relative z-10 pt-4 text-[11px] text-white/60 flex items-center justify-between">
              <span>{locale === 'ar' ? 'جراس فلوريست © 2026' : 'Grass Florist © 2026'}</span>
              <div className="flex items-center gap-1 text-[#E6C687]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'خصوصية وأمان 100%' : '100% Privacy & Protection'}</span>
              </div>
            </div>
          </div>

          {/* Right / Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Quick Switch Tabs */}
            <div className="flex items-center p-1 bg-[#FAF7F2] rounded-2xl border border-[#EBE2D7] mb-8 max-w-sm mx-auto w-full">
              <Link
                href={
                  locale === 'ar'
                    ? `/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                    : `/en/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                }
                className="flex-1 text-center py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#7D7065] hover:text-[#201B18] transition-colors"
              >
                {dict.auth.signIn}
              </Link>
              <span className="flex-1 text-center py-2.5 rounded-xl bg-white font-bold text-xs sm:text-sm text-[#435849] shadow-sm">
                {dict.auth.createAccount}
              </span>
            </div>

            {/* Form Header */}
            <div className="mb-6 text-start">
              <h1 className="text-2xl sm:text-3xl font-black text-[#201B18] tracking-tight">
                {dict.auth.registerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5">
                {dict.auth.registerSubtitle}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <div>
                <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                  {dict.auth.name} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={dict.auth.namePlaceholder}
                    className="w-full h-11 px-4 ps-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                  />
                  <User className="w-4 h-4 text-[#8C8075] absolute start-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full h-11 px-4 ps-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                    />
                    <Mail className="w-4 h-4 text-[#8C8075] absolute start-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                    {dict.auth.phone} <span className="text-text-muted font-normal">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={dict.auth.phonePlaceholder}
                      dir="ltr"
                      className="w-full h-11 px-4 ps-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all text-start"
                    />
                    <Phone className="w-4 h-4 text-[#8C8075] absolute start-4 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                    {dict.auth.password} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={dict.auth.passwordPlaceholder}
                      className="w-full h-11 px-4 ps-11 pe-10 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                    />
                    <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3.5 text-[#8C8075] hover:text-[#201B18] transition-colors cursor-pointer"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                    {dict.auth.confirmPassword} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={dict.auth.confirmPasswordPlaceholder}
                      className="w-full h-11 px-4 ps-11 pe-10 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                    />
                    <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3.5 top-3.5 text-[#8C8075] hover:text-[#201B18] transition-colors cursor-pointer"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-[#5C524B] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#435849] border-[#D5C6B5] focus:ring-[#435849] cursor-pointer shrink-0"
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
                className="w-full h-12 font-bold text-sm shadow-md hover:shadow-xl mt-3 transition-all rounded-xl"
              >
                <span>{dict.auth.createAccount}</span>
                <ArrowIcon className="w-4 h-4 ms-2" />
              </Button>
            </form>

            {/* Switch to Login */}
            <div className="mt-8 pt-6 border-t border-[#EAE1D7] text-center">
              <p className="text-xs sm:text-sm text-[#7D7065]">
                {dict.auth.alreadyHaveAccount}{' '}
                <Link
                  href={
                    locale === 'ar'
                      ? `/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                      : `/en/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
                  }
                  className="font-bold text-[#435849] hover:underline"
                >
                  {dict.auth.signIn}
                </Link>
              </p>
            </div>

            {/* Secure Trust Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#8C8075]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#435849]" />
              <span>{locale === 'ar' ? 'حساب آمن ومحمي بنظام تشفير كامل' : 'Protected by Enterprise Security'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

