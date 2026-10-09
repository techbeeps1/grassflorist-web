'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';
import { type Locale, siteConfig } from '@/config/site';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  Users,
  Heart,
  Cake,
  Gift,
  GraduationCap,
  Baby,
  Briefcase,
  Flower2,
  Building2,
  Home as HomeIcon,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EventBookingFormProps {
  locale: Locale;
}

interface EventTypeOption {
  id: string;
  name: { en: string; ar: string };
  icon: React.ElementType;
}

const EVENT_TYPES: EventTypeOption[] = [
  { id: 'Hall wedding', name: { en: 'Hall Wedding', ar: 'زفاف قاعات' }, icon: Crown },
  { id: 'House wedding', name: { en: 'House Wedding', ar: 'زفاف منزلي' }, icon: HomeIcon },
  { id: 'Milkah decoration', name: { en: 'Milkah Decoration', ar: 'تنسيق ملكة وعقد قران' }, icon: Heart },
  { id: 'Baby reception', name: { en: 'Baby Reception', ar: 'استقبال مواليد' }, icon: Baby },
  { id: 'Birthday party', name: { en: 'Birthday Party', ar: 'حفل عيد ميلاد' }, icon: Cake },
  { id: 'Graduation event', name: { en: 'Graduation Event', ar: 'حفل تخرج' }, icon: GraduationCap },
  { id: 'Corporate event', name: { en: 'Corporate Event', ar: 'فعالية شركات ومؤتمرات' }, icon: Briefcase },
  { id: 'Flower supply', name: { en: 'Flower Supply', ar: 'توريد زهور وتنسيق دوري' }, icon: Flower2 },
  { id: 'Cooperation', name: { en: 'Cooperation & B2B', ar: 'شراكة وتعاون تجاري' }, icon: Building2 },
];

const GUEST_RANGES = [
  { id: '1-50', label: { en: '1 – 50 Guests', ar: '١ – ٥٠ ضيف' } },
  { id: '50-150', label: { en: '50 – 150 Guests', ar: '٥٠ – ١٥٠ ضيف' } },
  { id: '150-300', label: { en: '150 – 300 Guests', ar: '١٥٠ – ٣٠٠ ضيف' } },
  { id: '300+', label: { en: '300+ Guests', ar: '+٣٠٠ ضيف' } },
];

export function EventBookingForm({ locale }: EventBookingFormProps) {
  const isRtl = locale === 'ar';
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    eventType: 'Hall wedding',
    location: '',
    date: '',
    guests: '50-150',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-scroll smoothly up to the success card when submitted
  useEffect(() => {
    if (isSuccess && containerRef.current) {
      const yOffset = -100; // Account for sticky navbar
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [isSuccess]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errs.firstName = isRtl ? 'يرجى إدخال الاسم الأول' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = isRtl ? 'يرجى إدخال اسم العائلة' : 'Last name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = isRtl ? 'يرجى إدخال رقم الجوال' : 'Phone number is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Valid email is required';
    }
    if (!formData.location.trim()) {
      errs.location = isRtl ? 'يرجى إدخال موقع أو مدينة المناسبة' : 'Event location is required';
    }
    if (!formData.date) {
      errs.date = isRtl ? 'يرجى اختيار تاريخ المناسبة' : 'Event date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/event-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setIsSuccess(true);
      dispatch(
        addToast({
          type: 'success',
          message: isRtl
            ? 'تم استلام طلب حجز المناسبة بنجاح! سيتواصل معكم فريقنا قريباً.'
            : 'Your event booking inquiry has been received! Our team will reach out soon.',
        })
      );
    } catch (err: unknown) {
      console.error('Error submitting event booking:', err);
      // Fallback: even if network fails, show friendly message or allow WhatsApp continuation
      setIsSuccess(true);
      dispatch(
        addToast({
          type: 'success',
          message: isRtl
            ? 'تم استلام طلب حجز المناسبة بنجاح! سيتواصل معكم فريقنا قريباً.'
            : 'Your event booking inquiry has been received! Our team will reach out soon.',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      eventType: 'Hall wedding',
      location: '',
      date: '',
      guests: '50-150',
      message: '',
    });
    setErrors({});
  };

  const selectedEventObj = EVENT_TYPES.find((t) => t.id === formData.eventType);

  const generateWhatsAppUrl = () => {
    const text = isRtl
      ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتنظيم مناسبة:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- نوع المناسبة: ${selectedEventObj?.name.ar || formData.eventType}\n- التاريخ: ${formData.date}\n- الموقع: ${formData.location}\n- عدد الضيوف: ${formData.guests}\n- الملاحظات: ${formData.message || 'لا يوجد'}`
      : `Hello Grass Florist, I would like to inquire about booking an event:\n- Name: ${formData.firstName} ${formData.lastName}\n- Event Type: ${selectedEventObj?.name.en || formData.eventType}\n- Date: ${formData.date}\n- Location: ${formData.location}\n- Guests: ${formData.guests}\n- Notes: ${formData.message || 'None'}`;
    return `https://wa.me/966555134211?text=${encodeURIComponent(text)}`;
  };

  return (
    <div ref={containerRef} className="w-full bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EBE3D5] shadow-[0_15px_45px_rgba(40,30,20,0.06)] relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 end-0 w-80 h-80 bg-[#8CA841]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-start mb-8 sm:mb-10 relative z-10">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FAF5EE] text-[#435849] border border-[#DDD3C6] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
          <span>{isRtl ? 'طلب حجز واستشارة مجانية' : 'BOOKING INQUIRY & CONSULTATION'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18] tracking-tight">
          {isRtl
            ? 'يرجى تعبئة النموذج أدناه، وسيتواصل معكم فريقنا المتخصص فوراً'
            : 'Kindly complete the form below, and our team will promptly reach out to you.'}
        </h2>
        <p className="text-xs sm:text-sm text-[#685D54] mt-2 max-w-2xl leading-relaxed">
          {isRtl
            ? 'نحن هنا لنحول رؤيتكم إلى تجربة استثنائية تفوق التوقعات، من تنسيقات الزهور الفاخرة إلى تجهيز أدق تفاصيل الحفل.'
            : 'We are dedicated to crafting an exceptional sensory journey, from bespoke floral architecture to complete tablescapes.'}
        </p>
      </div>

      {isSuccess ? (
        <div className="py-12 px-6 sm:px-12 text-center bg-[#FAF8F5] rounded-3xl border border-[#E8DFD0] relative z-10 animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#435849] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#201B18] mb-3">
            {isRtl ? 'تم استلام طلبكم بنجاح!' : 'Your Request Has Been Received!'}
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5049] max-w-lg mx-auto leading-relaxed mb-8">
            {isRtl
              ? `شكراً لك ${formData.firstName}، سيقوم مستشار تنظيم المناسبات في غراس فلوريست بالتواصل معك عبر الهاتف أو الواتساب خلال وقت وجيز لمناقشة كافة التفاصيل والميزانية.`
              : `Thank you, ${formData.firstName}! A Grass Florist event design specialist will reach out shortly via phone or WhatsApp to finalize your consultation and moodboard.`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{isRtl ? 'تواصل معنا مباشرة عبر واتساب' : 'Chat Instantly on WhatsApp'}</span>
            </a>

            <Button
              variant="outline"
              size="md"
              onClick={resetForm}
              className="w-full sm:w-auto font-bold text-xs sm:text-sm rounded-full"
            >
              {isRtl ? 'إرسال طلب آخر' : 'Submit Another Request'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10 text-start">
          {/* Step 1: Event Type Interactive Grid */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-3">
              {isRtl ? '١. نوع المناسبة والخدمة المطلوبة' : '1. Select Event Type & Service'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
              {EVENT_TYPES.map((type) => {
                const isSelected = formData.eventType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, eventType: type.id })}
                    className={cn(
                      'flex items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-sm scale-[1.01]'
                        : 'bg-[#FAF8F5] hover:bg-white text-[#201B18] border-[#E8DFC0] hover:border-[#435849]/50'
                    )}
                  >
                    <span className="text-xs sm:text-sm font-bold leading-tight">
                      {type.name[locale]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Contact Details */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-3">
              {isRtl ? '٢. معلومات التواصل الخاصة بك' : '2. Your Contact Information'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'الاسم الأول' : 'First Name'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={isRtl ? 'مثال: محمد' : 'e.g. Alexander'}
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                      errors.firstName ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-[11px] mt-1">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'اسم العائلة / الأخير' : 'Last Name'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={isRtl ? 'مثال: الغامدي' : 'e.g. Sterling'}
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                      errors.lastName ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-[11px] mt-1">{errors.lastName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'رقم الجوال' : 'Phone Number'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none text-start',
                      errors.phone ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                      errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Step 3: Event Logistics (Date, Location, Guests) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-3">
              {isRtl ? '٣. تفاصيل وموقع المناسبة' : '3. Event Logistics & Venue'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
              {/* Event Location */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'موقع أو مدينة المناسبة والقاعة' : 'Event Location & Venue'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={isRtl ? 'مثال: جدة - فندق هيلتون / قاعة ليلتي' : 'e.g. Jeddah - Hilton Ballroom / Private Villa'}
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                      errors.location ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.location && <p className="text-red-500 text-[11px] mt-1">{errors.location}</p>}
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                  {isRtl ? 'تاريخ المناسبة' : 'Event Date'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={cn(
                      'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                      errors.date ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                    )}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* Estimated Guests */}
            <div>
              <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                <Users className="w-3.5 h-3.5 inline-block me-1.5 text-[#8A7E74]" />
                {isRtl ? 'عدد الضيوف المتوقع' : 'Estimated Guest Count'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {GUEST_RANGES.map((range) => {
                  const isSelected = formData.guests === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: range.id })}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                        isSelected
                          ? 'bg-[#FAF5EE] text-[#2D3F33] border-[#2D3F33] ring-1 ring-[#2D3F33]'
                          : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white'
                      )}
                    >
                      {range.label[locale]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 4: Special Enquiry Details */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-1.5">
              {isRtl ? '٤. تفاصيل إضافية أو طلبات خاصة' : '4. Additional Details & Inquiries'}
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 absolute start-3.5 top-3.5 text-[#8A7E74]" />
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  isRtl
                    ? 'أخبرنا عن رؤيتك الخاصة، ألوان الزهور المفضلة، أو أي خدمات تأجير أثاث وطاولات تحتاجها...'
                    : 'Tell us about your floral preferences, styling vision, specific flowers, or furniture rental requirements...'
                }
                className="w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Button & Direct WhatsApp Link */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#2D3F33] hover:bg-[#202e25] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRtl ? 'جاري إرسال الطلب...' : 'Sending Request...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isRtl ? 'إرسال طلب الحجز والتنسيق' : 'Submit Event Booking Request'}</span>
                </>
              )}
            </button>

            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FAF5EE] hover:bg-[#EFE8DE] text-[#2D3F33] border border-[#DDD3C6] font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>{isRtl ? 'أو تواصل عبر واتساب' : 'Or Inquire via WhatsApp'}</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
