'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface ResetPasswordPageViewProps {
  locale: Locale;
}

export function ResetPasswordPageView({ locale }: ResetPasswordPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token') || 'demo_token';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [resetPasswordMutation, { isLoading }] = useResetPasswordMutation();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password.trim() || !confirmPassword.trim()) {
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

    try {
      await resetPasswordMutation({ token, newPassword: password }).unwrap();
      setIsSuccess(true);
      dispatch(
        addToast({
          type: 'success',
          message: dict.auth.resetSuccess,
        })
      );
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'تعذر إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.'
          : 'Failed to reset password. Link may be expired.'
      );
    }
  };

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.auth.resetPasswordTitle },
  ];

  return (
    <div className="min-h-[85vh] py-8 sm:py-14 bg-gradient-to-b from-[#FAF7F2] via-[#F6F0E6] to-[#FAF7F2] relative overflow-hidden">
      {/* Background soft ambient lights */}
      <div className="absolute top-10 start-10 w-72 h-72 rounded-full bg-[#435849]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-10 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

      <div className="site-container max-w-lg mx-auto relative z-10">
        <Breadcrumbs items={breadcrumbs} locale={locale} className="mb-6 justify-center" />

        <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-[#E9DFD3] shadow-[0_20px_60px_-15px_rgba(32,27,24,0.07)] text-center relative overflow-hidden">
          
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EBF1ED] to-[#FAF8F5] text-[#435849] flex items-center justify-center mx-auto mb-4 border border-[#D5C6B5]/40 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#201B18] tracking-tight">
            {dict.auth.resetPasswordTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-2 leading-relaxed max-w-sm mx-auto mb-8">
            {dict.auth.resetPasswordSubtitle}
          </p>

          {isSuccess ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 text-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">
                    {locale === 'ar' ? 'تم التحديث بنجاح!' : 'Password Updated!'}
                  </span>
                  <span>{dict.auth.resetSuccess}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={locale === 'ar' ? '/login' : '/en/login'}>
                  <Button variant="primary" size="lg" className="w-full h-12 font-bold text-sm shadow-md rounded-xl">
                    <span>{dict.auth.signIn}</span>
                    <ArrowIcon className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4.5 text-start">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#201B18] mb-1.5">
                  {dict.auth.newPassword} <span className="text-rose-500">*</span>
                </label>
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
                    className="w-full h-12 px-4 ps-11 pe-11 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl text-[#201B18] placeholder:text-[#9E9186] focus:outline-none focus:border-[#435849] focus:ring-2 focus:ring-[#435849]/15 transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#8C8075] absolute start-4 top-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-4 top-4 text-[#8C8075] hover:text-[#201B18] transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full h-12 font-bold text-sm shadow-md hover:shadow-xl mt-3 transition-all rounded-xl"
              >
                <span>{dict.auth.resetPasswordBtn}</span>
                <ArrowIcon className="w-4 h-4 ms-2" />
              </Button>

              <div className="pt-4 text-center">
                <Link
                  href={locale === 'ar' ? '/login' : '/en/login'}
                  className="text-xs font-bold text-[#435849] hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowIcon className="w-3.5 h-3.5 rotate-180" />
                  <span>{dict.auth.backToLogin}</span>
                </Link>
              </div>
            </form>
          )}

          {/* Secure Trust Note */}
          <div className="mt-8 pt-6 border-t border-[#EAE1D7] flex items-center justify-center gap-2 text-[11px] text-[#8C8075]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#435849]" />
            <span>{locale === 'ar' ? 'تشفير وحماية لكلمة المرور' : 'Secure & Encrypted Password Reset'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

