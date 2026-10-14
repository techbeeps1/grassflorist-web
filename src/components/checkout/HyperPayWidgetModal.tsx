'use client';

import React, { useEffect, useRef } from 'react';
import { Lock, X, ShieldCheck } from 'lucide-react';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';

interface HyperPayWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutId: string;
  scriptUrl: string;
  brands: string;
  orderNumber: string;
  amount: number;
  sarAmount?: number;
  currency?: string;
  locale?: 'ar' | 'en';
  returnUrl?: string;
}

export const HyperPayWidgetModal: React.FC<HyperPayWidgetModalProps> = ({
  isOpen,
  onClose,
  checkoutId,
  scriptUrl,
  brands,
  orderNumber,
  amount,
  sarAmount,
  currency = 'SAR',
  locale = 'ar',
  returnUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !scriptUrl) return;

    // Shopper result URL where HyperPay redirects back after 3DS authorization
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const basePath = locale === 'ar' ? '/checkout' : '/en/checkout';
    const finalResultUrl = returnUrl || `${origin}${basePath}?order_number=${encodeURIComponent(orderNumber)}&gateway=hyperpay`;

    // Clear previous widget form
    if (containerRef.current) {
      containerRef.current.innerHTML = '';

      const form = document.createElement('form');
      form.action = finalResultUrl;
      form.className = 'paymentWidgets';
      form.setAttribute('data-brands', brands);
      containerRef.current.appendChild(form);
    }

    // Inject HyperPay script
    const scriptId = 'hyperpay-widget-script';
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [isOpen, scriptUrl, checkoutId, brands, orderNumber, locale, returnUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-3xl md:max-w-[800px] overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8fae2a]/10 text-[#8fae2a] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                {locale === 'ar' ? 'بوابة الدفع الإلكتروني الآمن' : 'Secure Online Payment'}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {locale === 'ar' ? 'طلب رقم:' : 'Order #'} {orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            title={locale === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100/60 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-gray-700 block">
              {locale === 'ar' ? 'المبلغ المطلوب سداده:' : 'Amount to Pay:'}
            </span>
            {currency === 'USD' && (
              <span className="text-[10px] text-gray-500 font-medium block">
                {locale === 'ar' ? '(الخصم الفعلي من البطاقة بالريال السعودي)' : '(Bank charge in SAR)'}
              </span>
            )}
          </div>
          <div className="text-end">
            <span dir="ltr" className="font-black text-[#8fae2a] text-sm flex items-center justify-end gap-1">
              <CurrencySymbol className="w-3.5 h-3.5" forcedCurrency={(currency as 'SAR' | 'USD') || 'SAR'} />
              <span>{Number(amount).toFixed(2)} {currency}</span>
            </span>
            {currency === 'USD' && (
              <span dir="ltr" className="text-[11px] text-gray-500 font-semibold flex items-center justify-end gap-1 mt-0.5">
                <span>≈</span>
                <CurrencySymbol forcedCurrency="SAR" size={12} className="w-3 h-3 inline -mt-0.5" />
                <span>{Number(sarAmount || (amount / 0.2667)).toFixed(2)} SAR</span>
              </span>
            )}
          </div>
        </div>

        {/* HyperPay Widget Form Container */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-auto sm:overflow-x-hidden custom-scrollbar flex-1 min-h-[460px] sm:min-h-[520px] flex flex-col justify-start items-center">
          <div
            ref={containerRef}
            className="w-full flex justify-center items-start min-h-[420px] sm:min-h-[480px] [&_iframe]:w-full [&_iframe]:max-w-[620px] [&_iframe]:min-h-[460px] sm:[&_iframe]:min-h-[510px] [&_iframe]:border-0 [&_iframe]:mx-auto [&_.wpwl-container]:w-full [&_.wpwl-container]:flex [&_.wpwl-container]:justify-center [&_.wpwl-form]:w-full [&_.wpwl-form]:max-w-[620px] [&_.wpwl-form]:mx-auto"
          />
          <p className="text-[11px] text-gray-400 mt-5 pb-1 flex items-center justify-center gap-1.5 text-center px-4 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
            <span>
              {locale === 'ar'
                ? 'معاملة مشفرة ومحمية بمعايير الأمان العالمية 3D Secure'
                : 'Encrypted & protected transaction compliant with 3D Secure standards'}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-[11px] font-bold underline cursor-pointer"
          >
            {locale === 'ar' ? 'إلغاء واختيار وسيلة دفع أخرى' : 'Cancel & choose another payment method'}
          </button>
          <div className="flex items-center gap-2 opacity-90">
            <img
              src="/payments/mada-logo.svg"
              alt="mada"
              width={60}
              height={20}
              className="w-[60px] h-[20px] aspect-[3/1] object-contain"
            />
            <img src="/payments/visa.svg" alt="visa" width={46} height={20} className="h-[20px] w-auto max-w-[46px] object-contain" />
            <img src="/payments/mastercard.svg" alt="mastercard" width={46} height={20} className="h-[20px] w-auto max-w-[46px] object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};
