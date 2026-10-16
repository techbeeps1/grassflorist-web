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

    // Clean up any previously set options
    try {
      delete (window as any).wpwlOptions;
    } catch {}

    // Shopper result URL where HyperPay redirects back after 3DS authorization
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const basePath = locale === 'ar' ? '/checkout' : '/en/checkout';
    const finalResultUrl =
      returnUrl ||
      `${origin}${basePath}?order_number=${encodeURIComponent(orderNumber)}&gateway=hyperpay`;

    // Clear previous widget form
    if (containerRef.current) {
      containerRef.current.innerHTML = '';

      const form = document.createElement('form');
      form.action = finalResultUrl;
      form.className = 'paymentWidgets';
      form.setAttribute('data-brands', brands);
      containerRef.current.appendChild(form);
    }

    // Inject HyperPay script exactly like original staging
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
      try {
        delete (window as any).wpwlOptions;
      } catch {}
    };
  }, [isOpen, scriptUrl, checkoutId, brands, orderNumber, locale, returnUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-full sm:max-w-2xl md:max-w-[760px] lg:max-w-[800px] w-full overflow-hidden border border-gray-100 flex flex-col max-h-[94vh] sm:max-h-[92vh]"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-[#FAFAFA] shrink-0">
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
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-50/50 border-b border-emerald-100/60 flex items-center justify-between text-xs shrink-0">
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

        {/* Responsive style overrides for HyperPay payment form and 3DS challenge */}
        <style dangerouslySetInnerHTML={{ __html: `
          form.paymentWidgets,
          form.wpwl-form,
          .wpwl-container,
          .wpwl-form-card {
            width: 100% !important;
            max-width: 520px !important;
            min-width: 0 !important;
            margin-left: auto !important;
            margin-right: auto !important;
            box-sizing: border-box !important;
          }

          @media (max-width: 639px) {
            form.paymentWidgets,
            form.wpwl-form,
            .wpwl-container,
            .wpwl-form-card {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              margin: 0 auto !important;
              padding: 0 !important;
            }

            .wpwl-group {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              float: none !important;
            }

            .wpwl-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              float: none !important;
            }

            .wpwl-control,
            .wpwl-control-iframe {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              min-width: 0 !important;
            }

            .wpwl-label {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              float: none !important;
            }

            .wpwl-button-pay {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              float: none !important;
              margin-top: 14px !important;
            }
          }

          iframe.wpwl-target,
          .wpwl-target {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            min-height: 480px !important;
            border: none !important;
            margin: 0 auto !important;
            display: block !important;
            box-sizing: border-box !important;
          }

          @media (min-width: 640px) {
            iframe.wpwl-target,
            .wpwl-target {
              max-width: 620px !important;
              min-height: 520px !important;
            }
          }
        `}} />

        {/* HyperPay Widget Form Container (Without visible scrollbar track) */}
        <div className="p-3 sm:p-6 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 min-h-[420px] flex flex-col justify-start items-center w-full">
          <div ref={containerRef} className="w-full max-w-full flex justify-center min-h-[380px] overflow-hidden" />
          <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1 shrink-0 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
            <span>
              {locale === 'ar'
                ? 'معاملة مشفرة ومحمية بمعايير الأمان العالمية 3D Secure'
                : 'Encrypted & protected transaction compliant with 3D Secure standards'}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-[11px] font-bold underline cursor-pointer"
          >
            {locale === 'ar' ? 'إلغاء واختيار وسيلة دفع أخرى' : 'Cancel & choose another payment method'}
          </button>
          <div className="flex items-center gap-1.5 opacity-80 shrink-0">
            <img src="/payments/mada-logo.svg" alt="mada" className="h-3 object-contain" />
            <img src="/payments/visa.svg" alt="visa" className="h-3 object-contain" />
            <img src="/payments/mastercard.svg" alt="mastercard" className="h-3 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};
