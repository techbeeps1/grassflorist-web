'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Copy,
  Share2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Package,
  Calendar,
  Lock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useGetOrderByNumberQuery } from '@/store/api/ordersApi';
import {
  useGetPaymentMethodsQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} from '@/store/api/checkoutApi';
import { HyperPayWidgetModal } from '@/components/checkout/HyperPayWidgetModal';
import { TabbyInstallmentModal } from '@/components/checkout/TabbyInstallmentModal';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { useCurrency } from '@/hooks/useCurrency';

interface OrderPayViewProps {
  orderNumber: string;
  locale: 'ar' | 'en';
}

export const OrderPayView: React.FC<OrderPayViewProps> = ({ orderNumber, locale }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currency: activeCurrency, isUSD, sarToUsdRate } = useCurrency(locale);

  // Selected payment gateway method
  const [selectedGateway, setSelectedGateway] = useState<string>('mada');
  const [isInitiating, setIsInitiating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showTabbyModal, setShowTabbyModal] = useState<boolean>(false);

  // HyperPay Embedded Widget Modal State
  const [hyperpayWidget, setHyperpayWidget] = useState<{
    checkoutId: string;
    scriptUrl: string;
    brands: string;
    orderNumber: string;
    amount: number;
  } | null>(null);

  // Verification state on return from gateway
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  // Fetch Order Details
  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch: refetchOrder,
  } = useGetOrderByNumberQuery(orderNumber, {
    skip: !orderNumber,
  });

  // Fetch available gateways from backend
  const { data: dbPaymentMethods } = useGetPaymentMethodsQuery();

  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const isRtl = locale === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Handle return redirect verification from 3DS or external gateway
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hyperpayId = params.get('id');
    const token = params.get('token');
    const isPaymentReturn = Boolean(
      hyperpayId ||
      token ||
      params.get('payment_success') === '1' ||
      params.get('PayerID') ||
      params.get('tap_id')
    );
    const isCancelled = params.get('cancelled') === '1';
    const isFailed = params.get('failed') === '1';
    const gateway = params.get('gateway') || 'hyperpay';

    if (isCancelled) {
      setErrorMessage(
        isRtl
          ? 'تم إلغاء عملية الدفع. يمكنك إعادة المحاولة واختيار وسيلة دفع أخرى.'
          : 'Payment was cancelled. You can choose another payment method.'
      );
      return;
    }

    if (isFailed) {
      setErrorMessage(
        isRtl
          ? 'فشلت عملية الدفع. يرجى التحقق من البطاقة والمحاولة مرة أخرى.'
          : 'Payment failed. Please check your card or select another payment method.'
      );
      return;
    }

    if (isPaymentReturn && orderNumber) {
      setIsVerifying(true);
      verifyPayment({
        orderId: orderNumber,
        gateway,
        referenceId: hyperpayId || token || undefined,
      })
        .unwrap()
        .then((res: any) => {
          setIsVerifying(false);
          const isPaid = Boolean(res?.verification?.is_paid || res?.payment_status === 'paid');
          if (isPaid) {
            setVerificationSuccess(true);
            refetchOrder();
          } else {
            setErrorMessage(
              res?.verification?.result_description ||
              (isRtl
                ? 'لم تكتمل عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.'
                : 'Payment was not completed. Please try again.')
            );
          }
        })
        .catch((err: any) => {
          setIsVerifying(false);
          setErrorMessage(
            err?.data?.message ||
            (isRtl ? 'حدث خطأ أثناء التحقق من الدفع.' : 'Error verifying payment status.')
          );
        });
    }
  }, [orderNumber, isRtl, verifyPayment, refetchOrder]);

  // Dual Currency and Conversion Calculations
  const orderSarTotal = Number(order?.sarTotal || order?.sarAmount || order?.total || 0);
  const orderRate = (order?.exchangeRate && order.exchangeRate > 0 && order.exchangeRate < 1.0)
    ? order.exchangeRate
    : (sarToUsdRate && sarToUsdRate > 0 && sarToUsdRate < 1.0 ? sarToUsdRate : 0.2667);

  const orderUsdTotal = Number(
    order?.usdTotal && order.usdTotal < orderSarTotal
      ? order.usdTotal
      : (order?.currencyAmount && order.currencyAmount < orderSarTotal
        ? order.currencyAmount
        : Number((orderSarTotal * orderRate).toFixed(2)))
  );

  const isShowUsd = isUSD || selectedGateway === 'paypal' || order?.currency === 'USD';

  const subtotalSar = Number(order?.sarSubtotal || order?.subtotal || 0);
  const subtotalUsd = Number(order?.usdSubtotal || Number((subtotalSar * orderRate).toFixed(2)));

  const shippingFeeSar = Number(order?.sarShippingFee || order?.shippingFee || 0);
  const shippingFeeUsd = Number(order?.usdShippingFee || Number((shippingFeeSar * orderRate).toFixed(2)));

  const vatSar = Number(order?.sarVat || order?.vat || 0);
  const vatUsd = Number(order?.usdVat || Number((vatSar * orderRate).toFixed(2)));

  const discountSar = Number(order?.sarDiscount || order?.discount || 0);
  const discountUsd = Number(order?.usdDiscount || Number((discountSar * orderRate).toFixed(2)));

  // Handle Payment Initiation
  const handlePayNow = async () => {
    if (!order) return;
    setErrorMessage(null);
    setIsInitiating(true);

    try {
      let gatewayCode = selectedGateway;
      let brand = 'MADA';

      if (selectedGateway === 'mada') {
        gatewayCode = 'hyperpay';
        brand = 'MADA';
      } else if (selectedGateway === 'credit_card') {
        gatewayCode = 'hyperpay';
        brand = 'VISA MASTER AMEX';
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const returnPath = isRtl
        ? `/order-pay/${encodeURIComponent(order.orderNumber)}`
        : `/en/order-pay/${encodeURIComponent(order.orderNumber)}`;
      const returnUrl = `${origin}${returnPath}?gateway=${encodeURIComponent(gatewayCode)}&payment_success=1`;
      const cancelUrl = `${origin}${returnPath}?gateway=${encodeURIComponent(gatewayCode)}&cancelled=1`;

      const res = await initiatePayment({
        orderId: order.orderNumber,
        gateway: gatewayCode,
        payment_brand: brand,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        currency: isUSD ? 'USD' : 'SAR',
        exchange_rate: orderRate,
      } as any).unwrap();

      setIsInitiating(false);

      const isSuccess = Boolean(res?.success || res?.status === 'success');

      if (isSuccess) {
        // Direct Redirect Gateways (PayPal / Tabby / Tamara)
        if (res.redirect_url) {
          window.location.href = res.redirect_url;
          return;
        }

        // HyperPay Embedded Widget (Mada / Credit Cards)
        if (res.checkout_id && res.script_url) {
          setHyperpayWidget({
            checkoutId: res.checkout_id,
            scriptUrl: res.script_url,
            brands: brand || res.brands || 'MADA',
            orderNumber: order.orderNumber,
            amount: isShowUsd ? orderUsdTotal : orderSarTotal,
          });
          return;
        }
      }

      setErrorMessage(
        res?.message ||
        (isRtl ? 'تعذر بدء عملية الدفع، يرجى المحاولة لاحقاً.' : 'Unable to initiate payment.')
      );
    } catch (err: any) {
      setIsInitiating(false);
      setErrorMessage(
        err?.data?.message ||
        err?.message ||
        (isRtl ? 'فشل الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً.' : 'Connection to payment gateway failed.')
      );
    }
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 1. Loading State
  if (isOrderLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFD3] shadow-lg max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#8fae2a] border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-black text-gray-900">
            {isVerifying
              ? isRtl
                ? 'جاري التحقق من عملية الدفع...'
                : 'Verifying payment with bank...'
              : isRtl
              ? 'جاري تحميل تفاصيل الطلب...'
              : 'Loading order details...'}
          </h2>
          <p className="text-xs text-gray-500">
            {isRtl
              ? 'يرجى الانتظار، نقوم بمزامنة تفاصيل الفاتورة الإلكترونية الخاصة بك'
              : 'Please wait while we sync your invoice details securely'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Order Not Found Error State
  if (isOrderError || !order) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFD3] shadow-lg max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {isRtl ? 'لم يتم العثور على الطلب' : 'Order Not Found'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isRtl
                ? `الطلب برقم "${orderNumber}" غير موجود أو تم حذفه.`
                : `Order #${orderNumber} could not be found or has been removed.`}
            </p>
          </div>
          <Link
            href={isRtl ? '/' : '/en'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D3F33] hover:bg-[#202E25] text-white text-xs font-bold transition shadow-xs"
          >
            <BackIcon className="w-4 h-4" />
            <span>{isRtl ? 'العودة للرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid' || verificationSuccess;

  // 3. Order Already Paid State
  if (isPaid) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFD3] shadow-lg text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 ring-8 ring-emerald-50/50 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
                {isRtl ? 'تم سداد الطلب بنجاح' : 'Paid in Full'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
                {isRtl ? 'شكراً لك، تم سداد هذا الطلب!' : 'Thank You, Order is Paid!'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
                {isRtl
                  ? `تم استلام دفعتك للطلب رقم ${order.orderNumber} بنجاح وجاري تجهيز التنسيق للبدء بعملية التوصيل.`
                  : `Your payment for order #${order.orderNumber} was confirmed. We are preparing your flower arrangement for delivery.`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DFD3] text-start space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8DFD3]">
                <span className="text-gray-500">{isRtl ? 'رقم الطلب' : 'Order Number'}</span>
                <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8DFD3]">
                <span className="text-gray-500">{isRtl ? 'تاريخ الطلب' : 'Order Date'}</span>
                <span className="font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8DFD3]">
                <span className="text-gray-500">{isRtl ? 'المستلم' : 'Recipient'}</span>
                <span className="font-bold text-gray-900">{order.recipient.name} ({order.recipient.city})</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-black text-gray-900">
                <span>{isRtl ? 'المبلغ الإجمالي المسدد' : 'Total Amount Paid'}</span>
                <div dir="ltr" className="text-end">
                  <span className="text-[#8fae2a] flex items-center justify-end gap-1">
                    <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                    <span>{orderSarTotal.toFixed(2)} SAR</span>
                  </span>
                  {isShowUsd && (
                    <span className="text-xs text-gray-500 font-bold block mt-0.5">
                      ${orderUsdTotal.toFixed(2)} USD
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={isRtl ? '/account?tab=orders' : '/en/account?tab=orders'}
                className="px-6 py-3 rounded-xl bg-[#2D3F33] hover:bg-[#202E25] text-white text-xs font-bold transition shadow-xs"
              >
                {isRtl ? 'عرض طلباتي' : 'View My Orders'}
              </Link>
              <Link
                href={isRtl ? '/' : '/en'}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
              >
                {isRtl ? 'العودة للمتجر' : 'Return to Shop'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Order Unpaid State - The Payment Portal
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8fae2a]/10 text-[#8fae2a] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{isRtl ? 'في انتظار السداد' : 'Awaiting Payment'}</span>
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {isRtl ? 'سداد قيمة الطلب' : 'Pay for Order'} #{order.orderNumber}
                </h1>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isRtl
                ? 'يمكنك اختيار وسيلة الدفع المناسبة واستكمال السداد بأمان تام.'
                : 'Select your preferred payment gateway below to complete your order safely.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              title={isRtl ? 'نسخ رابط الدفع' : 'Copy payment link'}
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الرابط' : 'Copy Link')}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Payment Methods Selection */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">
                {isRtl ? 'اختر وسيلة الدفع الإلكتروني' : 'Select Payment Method'}
              </h2>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>{isRtl ? 'دفع إلكتروني آمن 100%' : '100% Secure Payment'}</span>
              </span>
            </div>

            <div className="space-y-3">
              {/* 1. Mada Debit Card */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedGateway === 'mada'
                    ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_gateway"
                    value="mada"
                    checked={selectedGateway === 'mada'}
                    onChange={() => setSelectedGateway('mada')}
                    className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                  />
                  <div>
                    <span className="block font-black">{isRtl ? 'بطاقة مدى البنكية' : 'Mada Debit Card'}</span>
                    <span className="text-[10px] text-gray-400 block font-normal">
                      {isRtl ? 'سداد مباشر وآمن عبر البنوك السعودية' : 'Direct & secure via Saudi banks'}
                    </span>
                  </div>
                </div>
                <img src="/payments/mada-logo.svg" alt="mada" className="h-4 object-contain shrink-0" />
              </label>

              {/* 2. Credit Cards */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedGateway === 'credit_card'
                    ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_gateway"
                    value="credit_card"
                    checked={selectedGateway === 'credit_card'}
                    onChange={() => setSelectedGateway('credit_card')}
                    className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                  />
                  <div>
                    <span className="block font-black">{isRtl ? 'البطاقات الائتمانية' : 'Credit Cards'}</span>
                    <span className="text-[10px] text-gray-400 block font-normal">
                      {isRtl ? 'فيزا، ماستركارد، أمريكان إكسبريس' : 'Visa, Mastercard, Amex'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                  <img src="/payments/mastercard.svg" alt="Mastercard" className="h-4 object-contain" />
                  <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />
                </div>
              </label>

              {/* 3. Tabby */}
              <div>
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedGateway === 'tabby'
                      ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_gateway"
                      value="tabby"
                      checked={selectedGateway === 'tabby'}
                      onChange={() => setSelectedGateway('tabby')}
                      className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                    />
                    <div>
                      <span className="block font-black">{isRtl ? 'الدفع لاحقاً عبر تابي' : 'Pay later with Tabby'}</span>
                      <span className="text-[10px] text-gray-400 block font-normal">
                        {isRtl ? 'قسّم فاتورتك على 4 دفعات بدون فوائد' : 'Split in 4 interest-free payments'}
                      </span>
                    </div>
                  </div>
                  <img src="/payments/tabby.svg" alt="Tabby" className="h-5.5 object-contain shrink-0" />
                </label>

                {selectedGateway === 'tabby' && (
                  <div className="mt-2 p-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">{isRtl ? 'القسط الشهري:' : 'Monthly payment:'}</span>
                      <div dir="ltr" className="text-end">
                        <span className="font-black text-[#8fae2a] block">
                          {(orderSarTotal / 4).toFixed(2)} SAR / {isRtl ? 'شهر' : 'mo'}
                        </span>
                        {isShowUsd && (
                          <span className="text-[10.5px] text-gray-500 font-semibold block">
                            ${(orderUsdTotal / 4).toFixed(2)} USD / {isRtl ? 'شهر' : 'mo'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTabbyModal(true)}
                      className="text-[11px] font-bold text-[#435849] underline cursor-pointer"
                    >
                      {isRtl ? 'عرض تفاصيل الأقساط' : 'View installment breakdown'}
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Tamara */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedGateway === 'tamara'
                    ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_gateway"
                    value="tamara"
                    checked={selectedGateway === 'tamara'}
                    onChange={() => setSelectedGateway('tamara')}
                    className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                  />
                  <div>
                    <span className="block font-black">{isRtl ? 'تمارا' : 'Tamara'}</span>
                    <span className="text-[10px] text-gray-400 block font-normal">
                      {isRtl ? 'قسّمها أو ادفع لاحقاً حسب الشروط' : 'Split or pay later'}
                    </span>
                  </div>
                </div>
                <img src="/payments/tamara.svg" alt="Tamara" className="h-5.5 object-contain shrink-0" />
              </label>

              {/* 5. PayPal */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedGateway === 'paypal'
                    ? 'border-[#8fae2a] bg-[#8fae2a]/5 font-bold text-gray-900 shadow-2xs ring-1 ring-[#8fae2a]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_gateway"
                    value="paypal"
                    checked={selectedGateway === 'paypal'}
                    onChange={() => setSelectedGateway('paypal')}
                    className="w-4 h-4 text-[#8fae2a] focus:ring-[#8fae2a]"
                  />
                  <div>
                    <span className="block font-black">{isRtl ? 'باي بال' : 'PayPal'}</span>
                    <span className="text-[10px] text-gray-400 block font-normal">
                      {isRtl ? 'سداد دولي بالبطاقات أو الرصيد' : 'International payment via balance/cards'}
                    </span>
                  </div>
                </div>
                <img src="/payments/paypal.svg" alt="PayPal" className="h-4.5 object-contain shrink-0" />
              </label>
            </div>

            {/* Pay Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isInitiating}
                className="w-full py-4 px-6 rounded-2xl bg-[#8fae2a] hover:bg-[#7d9b23] text-white font-black text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInitiating ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{isRtl ? 'جاري الاتصال بالبنك...' : 'Connecting to bank...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {selectedGateway === 'paypal'
                        ? isRtl
                          ? `ادفع عبر باي بال ($${orderUsdTotal.toFixed(2)} USD ≈ ${orderSarTotal.toFixed(2)} ر.س)`
                          : `Pay with PayPal ($${orderUsdTotal.toFixed(2)} USD ≈ ${orderSarTotal.toFixed(2)} SAR)`
                        : isShowUsd
                        ? isRtl
                          ? `ادفع الآن (${orderSarTotal.toFixed(2)} ر.س / $${orderUsdTotal.toFixed(2)} USD)`
                          : `Pay Now (${orderSarTotal.toFixed(2)} SAR / $${orderUsdTotal.toFixed(2)} USD)`
                        : isRtl
                        ? `ادفع الآن (${orderSarTotal.toFixed(2)} ر.س)`
                        : `Pay Now (${orderSarTotal.toFixed(2)} SAR)`}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>
                  {isRtl
                    ? 'جميع المعاملات المالية محمية بنظام التشفير الآمن 3D Secure'
                    : 'All transactions are encrypted and secured with 3D Secure'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary & Products Preview */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs space-y-6">
            <h2 className="text-base font-black text-gray-900 pb-3 border-b border-gray-100">
              {isRtl ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            {/* Order Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {order.items.map((item, idx) => {
                const itemSar = Number(item.itemTotal || 0);
                const itemUsd = Number((itemSar * orderRate).toFixed(2));
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                        {item.product.thumbnail ? (
                          <Image
                            src={formatStorageUrl(item.product.thumbnail)}
                            alt={item.product.name[locale] || 'Product'}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block truncate">
                          {item.product.name[locale] || 'Grass Flowers'}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {isRtl ? 'الكمية:' : 'Qty:'} {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <span dir="ltr" className="font-black text-gray-900 block">
                        {itemSar.toFixed(2)} SAR
                      </span>
                      {isShowUsd && (
                        <span dir="ltr" className="text-[10px] text-gray-500 font-medium block">
                          ${itemUsd.toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer & Delivery Preview */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">{isRtl ? 'المستلم:' : 'Recipient:'}</span>
                <span className="font-bold text-gray-900">{order.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isRtl ? 'المدينة:' : 'City:'}</span>
                <span className="font-semibold text-gray-900">{order.recipient.city}</span>
              </div>
              {order.recipient.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                  <span className="font-mono text-gray-900" dir="ltr">{order.recipient.phone}</span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>{isRtl ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <div dir="ltr" className="text-end">
                  <span className="font-semibold block">{subtotalSar.toFixed(2)} SAR</span>
                  {isShowUsd && (
                    <span className="text-[10.5px] text-gray-500 block">${subtotalUsd.toFixed(2)} USD</span>
                  )}
                </div>
              </div>
              {shippingFeeSar > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>
                    {isRtl
                      ? (order.shipping_method?.toLowerCase().includes('inside') || order.shipping_method?.toLowerCase().includes('jeddah')
                        ? 'التوصيل داخل جدة:'
                        : (order.shipping_method ? `${order.shipping_method}:` : 'التوصيل داخل جدة:'))
                      : (order.shipping_method ? `${order.shipping_method}:` : 'Delivery Inside Jeddah:')}
                  </span>
                  <div dir="ltr" className="text-end">
                    <span className="font-semibold block">{shippingFeeSar.toFixed(2)} SAR</span>
                    {isShowUsd && (
                      <span className="text-[10.5px] text-gray-500 block">${shippingFeeUsd.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>
              )}
              {vatSar > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>{isRtl ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                  <div dir="ltr" className="text-end">
                    <span className="font-semibold block">{vatSar.toFixed(2)} SAR</span>
                    {isShowUsd && (
                      <span className="text-[10.5px] text-gray-500 block">${vatUsd.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>
              )}
              {discountSar > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>{isRtl ? 'الخصم:' : 'Discount:'}</span>
                  <div dir="ltr" className="text-end">
                    <span className="block">-{discountSar.toFixed(2)} SAR</span>
                    {isShowUsd && (
                      <span className="text-[10.5px] block">-${discountUsd.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>
              )}

              {/* Total in SAR & USD (Matching Checkout View) */}
              <div className="pt-3 border-t border-gray-200 space-y-1.5">
                <div className="flex justify-between items-baseline text-base font-black text-gray-900">
                  <span>{isRtl ? 'الإجمالي المطلوب (SAR):' : 'Total Amount Due (SAR):'}</span>
                  <span dir="ltr" className="text-lg text-[#8fae2a] flex items-center gap-1">
                    <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                    <span>{orderSarTotal.toFixed(2)} SAR</span>
                  </span>
                </div>

                {isShowUsd && (
                  <div className="flex justify-between items-baseline text-xs font-bold text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span>{isRtl ? 'المجموع المقابل بالدولار الأمريكي:' : 'Equivalent in US Dollar:'}</span>
                    <span dir="ltr" className="text-[#8fae2a] font-extrabold text-sm">
                      ${orderUsdTotal.toFixed(2)} USD
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* HyperPay Widget Modal */}
        {hyperpayWidget && (
          <HyperPayWidgetModal
            isOpen={Boolean(hyperpayWidget)}
            onClose={() => setHyperpayWidget(null)}
            checkoutId={hyperpayWidget.checkoutId}
            scriptUrl={hyperpayWidget.scriptUrl}
            brands={hyperpayWidget.brands}
            orderNumber={hyperpayWidget.orderNumber}
            amount={isShowUsd ? orderUsdTotal : orderSarTotal}
            sarAmount={orderSarTotal}
            currency={isShowUsd ? 'USD' : 'SAR'}
            locale={locale}
            returnUrl={
              typeof window !== 'undefined'
                ? `${window.location.origin}${isRtl ? '' : '/en'}/order-pay/${encodeURIComponent(order.orderNumber)}?gateway=${encodeURIComponent(selectedGateway === 'mada' || selectedGateway === 'credit_card' ? 'hyperpay' : selectedGateway)}`
                : undefined
            }
          />
        )}

        {/* Tabby Installment Modal */}
        <TabbyInstallmentModal
          isOpen={showTabbyModal}
          onClose={() => setShowTabbyModal(false)}
          totalAmount={orderSarTotal}
          currency="SAR"
          locale={locale}
        />
      </div>
    </div>
  );
};
