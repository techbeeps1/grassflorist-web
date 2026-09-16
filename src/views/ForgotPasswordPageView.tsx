'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Button } from '@/components/ui/Button';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Leaf } from 'lucide-react';

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

  const loginUrl = locale === 'ar' ? '/login' : '/en/login';

  return (
    <div className="min-h-[85vh] py-10 sm:py-16 bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2D3F33]/[0.03] blur-3xl pointer-events-none" />

      {/* Main Single Centered Card */}
      <div className="w-full max-w-[550px] bg-[#FDFBF7] rounded-[28px] sm:rounded-[32px] border border-[#EFE8DE] shadow-[0_12px_45px_-12px_rgba(45,36,28,0.07)] p-7 sm:p-10 relative z-10 text-start">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#2D3F33]/10 text-[#2D3F33] flex items-center justify-center mb-6 border border-[#2D3F33]/15">
          <KeyRound className="w-6 h-6" />
        </div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl sm:text-[34px] font-serif font-black text-[#1E1915] tracking-tight leading-tight">
            {dict.auth.forgotPasswordTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5 leading-relaxed">
            {dict.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="text-start space-y-6 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">
                  {locale === 'ar' ? 'تم إرسال الرابط بنجاح!' : 'Reset Link Sent!'}
                </span>
                <span>{dict.auth.resetEmailSent}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href={loginUrl}>
                <Button variant="primary" size="lg" className="w-full h-12 rounded-full bg-[#2D3F33] hover:bg-[#202E25] font-bold text-sm shadow-md">
                  <span>{dict.auth.backToLogin}</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                {errorMsg}
              </div>
            )}

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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 rounded-full bg-[#2D3F33] hover:bg-[#202E25] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              <span>{dict.auth.sendResetLink}</span>
              <ArrowIcon className="w-4 h-4 ms-1" />
            </Button>

            {/* Botanical Leaf Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EAE1D5]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FDFBF7] px-3 text-[#9A8D80]">
                  <Leaf className="w-4 h-4 rotate-45 text-[#8C7E72]" />
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={loginUrl}
                className="text-xs font-bold text-[#1E1915] hover:text-[#2D3F33] hover:underline inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowIcon className="w-3.5 h-3.5 rotate-180" />
                <span>{dict.auth.backToLogin}</span>
              </Link>
            </div>
          </form>
        )}

        {/* Secure Trust Note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#9A8D80]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D3F33]" />
          <span>{locale === 'ar' ? 'نظام استرجاع آمن ومشفّر 256-bit SSL' : '256-bit SSL Encrypted & Protected'}</span>
        </div>
      </div>
    </div>
  );
}
