'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ForgotPasswordPageViewProps {
  locale: Locale;
}

export function ForgotPasswordPageView({ locale }: ForgotPasswordPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [forgotPasswordMutation, { isLoading }] = useForgotPasswordMutation();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg(dict.validation.required);
      return;
    }

    try {
      await forgotPasswordMutation({ email: email.trim() }).unwrap();
      setIsSubmitted(true);
      dispatch(
        addToast({
          type: 'success',
          message: dict.auth.resetEmailSent,
        })
      );
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'حدث خطأ أثناء إرسال الرابط. يرجى المحاولة لاحقاً.'
          : 'Failed to send reset link. Please try again.'
      );
    }
  };

  const breadcrumbs = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.auth.signIn, href: locale === 'ar' ? '/login' : '/en/login' },
    { label: dict.auth.forgotPasswordTitle },
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
            <KeyRound className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#201B18] tracking-tight">
            {dict.auth.forgotPasswordTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-2 leading-relaxed max-w-sm mx-auto mb-8">
            {dict.auth.forgotPasswordSubtitle}
          </p>

          {/* Success State */}
          {isSubmitted ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 text-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">
                    {locale === 'ar' ? 'تم إرسال الرابط بنجاح!' : 'Reset Link Sent!'}
                  </span>
                  <span>{dict.auth.resetEmailSent}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={locale === 'ar' ? '/login' : '/en/login'}>
                  <Button variant="primary" size="lg" className="w-full h-12 font-bold text-sm shadow-md rounded-xl">
                    <span>{dict.auth.backToLogin}</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4.5 text-start">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                  {errorMsg}
                </div>
              )}

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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full h-12 font-bold text-sm shadow-md hover:shadow-xl mt-3 transition-all rounded-xl"
              >
                <span>{dict.auth.sendResetLink}</span>
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
            <span>{locale === 'ar' ? 'نظام استرجاع آمن ومشفّر' : 'Secure & Encrypted Recovery System'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

