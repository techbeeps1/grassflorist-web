'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { Product } from '@/types/product';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import { SubscriptionConfig } from './SubscriptionPurchaseSelector';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCw,
  Truck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  config: SubscriptionConfig;
  locale: Locale;
}

export function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  product,
  quantity,
  config,
  locale,
}: SubscriptionCheckoutModalProps) {
  const router = useRouter();
  const isAr = locale === 'ar';

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jeddah');
  const [district, setDistrict] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'hyperpay' | 'paypal' | 'cod'>('hyperpay');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSub, setCompletedSub] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const activeLocale = locale === 'en' ? 'en' : 'ar';
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '').replace(/\/api$/, '') + `/api/${activeLocale}`;
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('grass_auth_token') || localStorage.getItem('token') || localStorage.getItem('customer_token')
        : null;

      const payload = {
        product_id: product.id,
        quantity: quantity,
        frequency: config.frequency,
        duration_type: config.durationType,
        start_date: config.startDate,
        delivery_time_slot: config.timeSlot,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        email: email,
        address: address,
        city: city,
        district: district,
        card_message: giftMessage,
        special_instructions: specialInstructions,
        payment_gateway: paymentGateway,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}/subscriptions/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || (isAr ? 'تعذر إنشاء الاشتراك، يرجى المحاولة لاحقاً.' : 'Failed to create subscription.'));
      }

      setCompletedSub(data.data.subscription);
    } catch (err: any) {
      setErrorMessage(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricing = config.calculatedPricing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4D8CB] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E4D8CB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#2C382F]">
                {isAr ? 'تأكيد اشتراك الزهور الدوري' : 'Subscription Checkout'}
              </h2>
              <p className="text-xs text-[#7A6E65]">
                {isAr ? 'خصم 10% تلقائي وتوصيل مجدول' : '10% recurring discount & flexible schedule'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A6E65] hover:text-[#2C382F] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-start">
          {completedSub ? (
            /* Success Screen */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#2C382F]">
                  {isAr ? 'تم تفعيل اشتراكك بنجاح!' : 'Subscription Activated Successfully!'}
                </h3>
                <p className="text-sm text-[#7A6E65] mt-1">
                  {isAr
                    ? `رقم الاشتراك: #${completedSub.subscription_number}`
                    : `Subscription Reference: #${completedSub.subscription_number}`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4D8CB] max-w-md mx-auto text-xs text-[#5C524B] space-y-2 text-start">
                <div className="flex justify-between">
                  <span>{isAr ? 'المنتج' : 'Product'}:</span>
                  <span className="font-bold text-[#2C382F]">
                    {product.name?.[locale] || product.name?.ar}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'أول موعد توصيل' : 'First Delivery Date'}:</span>
                  <span className="font-bold text-emerald-800">
                    {completedSub.next_delivery_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الكمية لكل دورة' : 'Quantity Per Cycle'}:</span>
                  <span className="font-bold">{completedSub.quantity}</span>
                </div>
                <div className="flex justify-between border-t border-[#E4D8CB] pt-2 font-bold text-sm text-[#2C382F]">
                  <span>{isAr ? 'المبلغ لكل توصيل' : 'Amount Per Delivery'}:</span>
                  <span className="text-emerald-700 font-black">
                    SAR {completedSub.total_per_delivery}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(locale === 'ar' ? '/account?tab=subscriptions' : '/en/account?tab=subscriptions');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#435849] hover:bg-[#34463A] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {isAr ? 'إدارة اشتراكاتي في لوحة التحكم' : 'Manage My Subscriptions'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-[#DDD3C4] bg-white hover:bg-[#FAF7F2] text-[#2C382F] font-bold text-sm transition-all cursor-pointer"
                >
                  {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Snapshot Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.thumbnail || product.images?.[0] || '/placeholder.png'}
                    alt="Product"
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#2C382F]">
                      {product.name?.[locale] || product.name?.ar}
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {isAr
                        ? `الكمية: ${quantity} | ${config.frequency} | تبدأ: ${config.startDate}`
                        : `Qty: ${quantity} | ${config.frequency} | Starts: ${config.startDate}`}
                    </p>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                    {isAr ? 'لكل دورة' : 'Per Cycle'}
                  </span>
                  <span className="text-base font-black text-emerald-900">
                    SAR {pricing ? pricing.total_per_delivery : Math.round(product.price * 0.9 * quantity + 30)}
                  </span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6E65]">
                  {isAr ? 'بيانات المستلم والتوصيل' : 'Recipient & Delivery Details'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#2C382F] block mb-1">
                      {isAr ? 'اسم المستلم' : 'Recipient Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={isAr ? 'محمد العتيبي' : 'Full Name'}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C382F] block mb-1">
                      {isAr ? 'رقم الجوال (سعودي)' : 'Mobile Phone'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C382F] block mb-1">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C382F] block mb-1">
                      {isAr ? 'المدينة' : 'City'} *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                    >
                      <option value="Jeddah">{isAr ? 'جدة' : 'Jeddah'}</option>
                      <option value="Riyadh">{isAr ? 'الرياض' : 'Riyadh'}</option>
                      <option value="Makkah">{isAr ? 'مكة المكرمة' : 'Makkah'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#2C382F] block mb-1">
                      {isAr ? 'عنوان التوصيل والحي' : 'Delivery Address & District'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={isAr ? 'اسم الشارع، رقم المبنى، الحي' : 'Street name, building, district'}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                    />
                  </div>
                </div>
              </div>

              {/* Gift Message & Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6E65]">
                  {isAr ? 'بطاقة الإهداء والتعليمات' : 'Gift Card & Special Instructions'}
                </h3>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالة الإهداء المرفقة مع باقة الزهور...' : 'Write your gift card message...'}
                  rows={2}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#435849]"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6E65]">
                  {isAr ? 'طريقة الدفع للتكرار الآلي' : 'Payment Method for Automated Renewals'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      paymentGateway === 'hyperpay'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 font-bold'
                        : 'border-[#DDD3C4] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="hyperpay"
                      checked={paymentGateway === 'hyperpay'}
                      onChange={() => setPaymentGateway('hyperpay')}
                      className="accent-emerald-700"
                    />
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs">
                      {isAr ? 'مدى / فيزا / أبل باي' : 'Mada / Card / Apple Pay'}
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      paymentGateway === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 font-bold'
                        : 'border-[#DDD3C4] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="cod"
                      checked={paymentGateway === 'cod'}
                      onChange={() => setPaymentGateway('cod')}
                      className="accent-emerald-700"
                    />
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs">
                      {isAr ? 'الدفع عند التوصيل' : 'Cash on Delivery'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-[#E4D8CB]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isAr ? 'جاري تفعيل الاشتراك...' : 'Activating Subscription...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{isAr ? 'تأكيد وبدء الاشتراك الآن' : 'Confirm & Start Subscription'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
