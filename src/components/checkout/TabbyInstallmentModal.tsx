'use client';

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Moon } from 'lucide-react';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';

interface TabbyInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  currency?: string;
  locale?: 'ar' | 'en';
}

export const TabbyInstallmentModal: React.FC<TabbyInstallmentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  currency = 'SAR',
  locale = 'ar',
}) => {
  if (!isOpen) return null;

  const installment = Number((totalAmount / 4).toFixed(2));

  const steps = [
    {
      title: locale === 'ar' ? 'الدفعة الأولى اليوم' : '1st Payment Today',
      desc: locale === 'ar' ? 'عند إتمام الطلب مباشرة' : 'Charged immediately at checkout',
      pct: '25%',
    },
    {
      title: locale === 'ar' ? 'بعد شهر واحد' : 'In 1 Month',
      desc: locale === 'ar' ? 'تُخصم تلقائياً بعد 30 يوماً' : 'Automatically charged after 30 days',
      pct: '25%',
    },
    {
      title: locale === 'ar' ? 'بعد شهرين' : 'In 2 Months',
      desc: locale === 'ar' ? 'تُخصم تلقائياً بعد 60 يوماً' : 'Automatically charged after 60 days',
      pct: '25%',
    },
    {
      title: locale === 'ar' ? 'بعد ثلاثة أشهر' : 'In 3 Months',
      desc: locale === 'ar' ? 'الدفعة الأخيرة وتكتمل القيمة' : 'Final installment to finish',
      pct: '25%',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header with Tabby logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <img src="/payments/tabby.svg" alt="Tabby" className="h-6 object-contain" />
            <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
              {locale === 'ar' ? 'قسّم مشترياتك على 4 دفعات' : 'Split into 4 payments'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-xs text-gray-600 block mb-1">
              {locale === 'ar' ? 'قيمة القسط الشهري' : 'Monthly Installment'}
            </span>
            <div dir="ltr" className="text-2xl font-black text-[#8fae2a] flex items-center justify-center gap-1">
              <CurrencySymbol className="w-5 h-5" forcedCurrency={(currency as 'SAR' | 'USD') || 'SAR'} />
              <span>{installment} {currency}</span>
              <span className="text-xs text-gray-500 font-normal">/mo</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-1">
              {locale === 'ar'
                ? `المجموع الإجمالي: ${totalAmount} ${currency} (بدون أي فوائد إضافية)`
                : `Total: ${totalAmount} ${currency} (0% interest & zero fees)`}
            </span>
          </div>

          {/* 4 Steps timeline */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{step.title}</span>
                    <span dir="ltr" className="text-xs font-black text-gray-900">
                      {installment} {currency}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center text-[10.5px] text-gray-600">
            <div className="p-2 rounded-lg bg-gray-50">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
              <span>{locale === 'ar' ? 'بدون فوائد' : '0% Interest'}</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <Moon className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
              <span>{locale === 'ar' ? 'متوافق شرعاً' : 'Shariah Ok'}</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
              <span>{locale === 'ar' ? 'حماية تامة' : 'Protected'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#8fae2a] hover:bg-[#7d9b23] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {locale === 'ar' ? 'فهمت ذلك، المتابعة للدفع' : 'Got it, Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
