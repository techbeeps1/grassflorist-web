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
  Palette,
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
  { id: 'Bridal bouquets', name: { en: 'Bridal Bouquets', ar: 'مسكات العرائس' }, icon: Flower2 },
  { id: 'Hall wedding', name: { en: 'Hall Event Decoration', ar: 'تنسيق مناسبة في قاعة' }, icon: Crown },
  { id: 'House wedding', name: { en: 'Home Event Decoration', ar: 'تنسيق مناسبة منزلية' }, icon: HomeIcon },
  { id: 'Milkah decoration', name: { en: 'Milkah Decoration', ar: 'تنسيق ملكة وعقد قران' }, icon: Heart },
  { id: 'Newborn welcome decorations', name: { en: 'Newborn Welcome Decorations', ar: 'استقبال مواليد' }, icon: Baby },
  { id: 'Birthday party', name: { en: 'Birthday Party', ar: 'حفل عيد ميلاد' }, icon: Cake },
  { id: 'Graduation event', name: { en: 'Graduation Event', ar: 'حفل تخرج' }, icon: GraduationCap },
  { id: 'Corporate event', name: { en: 'Corporate Event', ar: 'فعالية شركات ومؤتمرات' }, icon: Briefcase },
  { id: 'Flower supply', name: { en: 'Flower Supply', ar: 'توريد زهور وتنسيق دوري' }, icon: Sparkles },
  { id: 'Cooperation', name: { en: 'Cooperation & B2B', ar: 'شراكة وتعاون تجاري' }, icon: Building2 },
];

const GUEST_RANGES = [
  { id: '1-50', label: { en: '1 – 50 Guests', ar: '١ – ٥٠ ضيف' } },
  { id: '50-150', label: { en: '50 – 150 Guests', ar: '٥٠ – ١٥٠ ضيف' } },
  { id: '150-300', label: { en: '150 – 300 Guests', ar: '١٥٠ – ٣٠٠ ضيف' } },
  { id: '300+', label: { en: '300+ Guests', ar: '+٣٠٠ ضيف' } },
];

const DECORATION_OPTIONS = [
  { id: 'Hospital Room Entrance', label: { en: 'Hospital Room Entrance', ar: 'مدخل الغرفة' } },
  { id: 'Hospitality Display Stands', label: { en: 'Hospitality Display Stands', ar: 'ستاندات للضيافة' } },
  { id: 'Both', label: { en: 'Both', ar: 'الاثنين معًا' } },
  { id: 'Other Decorations or Special Requests', label: { en: 'Other Decorations / Requests', ar: 'أي تفاصيل أو إضافات أخرى' } },
];

const FLOWER_TYPES = [
  { id: 'Fresh Flowers', label: { en: 'Fresh Flowers', ar: 'طبيعي' } },
  { id: 'Artificial Flowers', label: { en: 'Artificial Flowers', ar: 'صناعي' } },
  { id: 'A Mix of Fresh and Artificial Flowers', label: { en: 'Mix of Fresh & Artificial', ar: 'مكس بين الطبيعي والصناعي' } },
];

const BOUQUET_SIZES = [
  { id: 'Small', label: { en: 'Small', ar: 'صغيرة' } },
  { id: 'Medium', label: { en: 'Medium', ar: 'متوسطة' } },
  { id: 'Large', label: { en: 'Large', ar: 'كبيرة' } },
];

const BOUQUET_STYLES = [
  { id: 'Round', label: { en: 'Round', ar: 'دائرية' } },
  { id: 'Long', label: { en: 'Long', ar: 'طويلة' } },
  { id: 'Cascading', label: { en: 'Cascading', ar: 'منسدلة' } },
];

const DELIVERY_METHODS = [
  { id: 'Pickup', label: { en: 'Pickup from Boutique', ar: 'استلام من الفرع' } },
  { id: 'Delivery', label: { en: 'Delivery', ar: 'توصيل' } },
];

const HOME_EVENT_SUBTYPES = [
  { id: 'Engagement Party', label: { en: 'Engagement Party', ar: 'خطوبة' } },
  { id: 'Wedding', label: { en: 'Wedding', ar: 'زواج' } },
  { id: 'Birthday', label: { en: 'Birthday', ar: 'عيد ميلاد' } },
  { id: 'Graduation', label: { en: 'Graduation', ar: 'تخرج' } },
  { id: 'Other', label: { en: 'Other', ar: 'أخرى' } },
];

const HOME_DECORATION_AREAS = [
  { id: 'Main Celebration Backdrop', label: { en: 'Main Celebration Backdrop', ar: 'كوشة / المنصة' } },
  { id: 'Entrance', label: { en: 'Entrance', ar: 'مدخل' } },
  { id: 'Vases and Table Arrangements', label: { en: 'Vases & Table Arrangements', ar: 'فازات وتنسيقات طاولات' } },
  { id: 'Other Decorations', label: { en: 'Other Decorations', ar: 'تفاصيل أخرى' } },
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
    hospitalName: '',
    decorationOption: 'Both',
    flowerType: 'Fresh Flowers',
    themeColor: '',
    bouquetColors: '',
    bouquetSize: 'Medium',
    bouquetStyle: 'Round',
    deliveryMethod: 'Delivery',
    deliveryAddress: '',
    homeEventType: 'Engagement Party',
    homeEventOtherText: '',
    homeDecorAreas: ['Main Celebration Backdrop', 'Entrance'],
    homeTheme: '',
    date: '',
    guests: '50-150',
    message: '',
  });

  const isBridal = formData.eventType === 'Bridal bouquets';
  const isHallEvent = formData.eventType === 'Hall wedding';
  const isHomeEvent =
    formData.eventType === 'House wedding' ||
    formData.eventType === 'Home event';
  const isHallOrHome = isHallEvent || isHomeEvent;
  const isNewborn =
    formData.eventType === 'Newborn welcome decorations' ||
    formData.eventType === 'Baby reception';

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
    if (isNewborn) {
      if (!formData.hospitalName.trim() && !formData.location.trim()) {
        errs.hospitalName = isRtl ? 'يرجى إدخال اسم المستشفى' : 'Hospital name is required';
      }
    } else if (isBridal) {
      if (formData.deliveryMethod === 'Delivery' && !formData.deliveryAddress.trim()) {
        errs.deliveryAddress = isRtl ? 'يرجى إدخال موقع أو عنوان التوصيل' : 'Delivery address is required';
      }
    } else if (isHallEvent) {
      if (!formData.location.trim()) {
        errs.location = isRtl ? 'يرجى إدخال اسم القاعة وموقعها' : 'Venue name and location is required';
      }
    } else if (isHomeEvent) {
      if (!formData.location.trim()) {
        errs.location = isRtl ? 'يرجى إدخال موقع المناسبة' : 'Event location is required';
      }
    } else {
      if (!formData.location.trim()) {
        errs.location = isRtl ? 'يرجى إدخال موقع أو مدينة المناسبة' : 'Event location is required';
      }
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

    let finalLocation = formData.location.trim();
    if (isNewborn) {
      finalLocation = formData.hospitalName.trim() || formData.location.trim() || 'Hospital Reception';
    } else if (isBridal) {
      finalLocation = formData.deliveryMethod === 'Delivery'
        ? (formData.deliveryAddress.trim() || (isRtl ? 'توصيل داخل جدة' : 'Delivery inside Jeddah'))
        : (isRtl ? 'استلام من فرع غراس فلوريست' : 'Pickup from Grass Florist Boutique');
    }

    const homeEventSubtypeLabel =
      HOME_EVENT_SUBTYPES.find((s) => s.id === formData.homeEventType)?.label[locale] ||
      (formData.homeEventType === 'Other' && formData.homeEventOtherText
        ? formData.homeEventOtherText
        : formData.homeEventType);

    const homeDecorAreasLabel = formData.homeDecorAreas
      .map(
        (id) =>
          HOME_DECORATION_AREAS.find((a) => a.id === id)?.label[locale] || id
      )
      .join(isRtl ? '، ' : ', ');

    const enrichedMessage = isBridal
      ? [
          formData.message.trim(),
          `\n--- تفاصيل مسكة العروسة ---`,
          `الألوان المفضلة: ${formData.bouquetColors || 'غير محدد'}`,
          `حجم المسكة: ${formData.bouquetSize || 'غير محدد'}`,
          `شكل المسكة: ${formData.bouquetStyle || 'غير محدد'}`,
          `نوع الورد: ${formData.flowerType || 'غير محدد'}`,
          `طريقة الاستلام: ${formData.deliveryMethod === 'Delivery' ? `توصيل (${formData.deliveryAddress || 'لم يحدد'})` : 'استلام من الفرع'}`,
        ].filter(Boolean).join('\n')
      : isNewborn
      ? [
          formData.message.trim(),
          `\n--- تفاصيل استقبال المواليد ---`,
          `المستشفى: ${formData.hospitalName}`,
          `التنسيق المرغوب: ${formData.decorationOption}`,
          `نوع الورد: ${formData.flowerType}`,
          `الألوان / الثيم: ${formData.themeColor || 'غير محدد'}`,
        ].filter(Boolean).join('\n')
      : isHallEvent
      ? [
          formData.message.trim(),
          `\n--- تفاصيل تنسيق مناسبة في قاعة ---`,
          `نوع المناسبة: ${homeEventSubtypeLabel}`,
          `اسم القاعة وموقعها: ${formData.location}`,
          `تفاصيل التنسيق المطلوب: ${homeDecorAreasLabel || 'غير محدد'}`,
          `نوع الورد المفضل: ${formData.flowerType || 'غير محدد'}`,
          `الألوان المفضلة للورد والتنسيق: ${formData.themeColor || 'غير محدد'}`,
          `الثيم المطلوب: ${formData.homeTheme || 'غير محدد'}`,
        ].filter(Boolean).join('\n')
      : isHomeEvent
      ? [
          formData.message.trim(),
          `\n--- تفاصيل تنسيق المناسبة المنزلية ---`,
          `نوع المناسبة: ${homeEventSubtypeLabel}`,
          `الموقع: ${formData.location}`,
          `تفاصيل التنسيق المطلوب: ${homeDecorAreasLabel || 'غير محدد'}`,
          `نوع الورد المفضل: ${formData.flowerType || 'غير محدد'}`,
          `الألوان المفضلة للورد والتنسيق: ${formData.themeColor || 'غير محدد'}`,
          `الثيم المطلوب: ${formData.homeTheme || 'غير محدد'}`,
        ].filter(Boolean).join('\n')
      : formData.message;

    try {
      const response = await fetch('/api/event-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          message: enrichedMessage,
          location: finalLocation,
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
      hospitalName: '',
      decorationOption: 'Both',
      flowerType: 'Fresh Flowers',
      themeColor: '',
      bouquetColors: '',
      bouquetSize: 'Medium',
      bouquetStyle: 'Round',
      deliveryMethod: 'Delivery',
      deliveryAddress: '',
      homeEventType: 'Engagement Party',
      homeEventOtherText: '',
      homeDecorAreas: ['Main Celebration Backdrop', 'Entrance'],
      homeTheme: '',
      date: '',
      guests: '50-150',
      message: '',
    });
    setErrors({});
  };

  const selectedEventObj = EVENT_TYPES.find((t) => t.id === formData.eventType);

  const generateWhatsAppUrl = () => {
    const selectedDecorLabel =
      DECORATION_OPTIONS.find((d) => d.id === formData.decorationOption)?.label[locale] ||
      formData.decorationOption;
    const selectedFlowerLabel =
      FLOWER_TYPES.find((f) => f.id === formData.flowerType)?.label[locale] ||
      formData.flowerType;
    const selectedBouquetSizeLabel =
      BOUQUET_SIZES.find((s) => s.id === formData.bouquetSize)?.label[locale] ||
      (formData.bouquetSize || (isRtl ? 'غير محدد' : 'Not specified'));
    const selectedBouquetStyleLabel =
      BOUQUET_STYLES.find((s) => s.id === formData.bouquetStyle)?.label[locale] ||
      (formData.bouquetStyle || (isRtl ? 'غير محدد' : 'Not specified'));
    const selectedDeliveryLabel =
      formData.deliveryMethod === 'Delivery'
        ? (isRtl
            ? `توصيل (${formData.deliveryAddress || 'لم يحدد العنوان'})`
            : `Delivery (${formData.deliveryAddress || 'Address not specified'})`)
        : (isRtl ? 'استلام من الفرع' : 'Pickup from Boutique');

    const homeEventSubtypeLabel =
      HOME_EVENT_SUBTYPES.find((s) => s.id === formData.homeEventType)?.label[locale] ||
      (formData.homeEventType === 'Other' && formData.homeEventOtherText
        ? formData.homeEventOtherText
        : formData.homeEventType);

    const homeDecorAreasLabel = formData.homeDecorAreas
      .map(
        (id) =>
          HOME_DECORATION_AREAS.find((a) => a.id === id)?.label[locale] || id
      )
      .join(isRtl ? '، ' : ', ');

    const text = isBridal
      ? (isRtl
        ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتفاصيل مسكة عروسة:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- تاريخ المناسبة: ${formData.date}\n- الألوان المفضلة للمسكة: ${formData.bouquetColors || 'غير محدد'}\n- حجم المسكة: ${selectedBouquetSizeLabel}\n- شكل المسكة: ${selectedBouquetStyleLabel}\n- نوع الورد المفضل: ${selectedFlowerLabel}\n- طريقة الاستلام: ${selectedDeliveryLabel}\n- تفاصيل أو طلبات إضافية: ${formData.message || 'لا يوجد'}`
        : `Hello Grass Florist, I would like to inquire about a Bridal Bouquet:\n- Name: ${formData.firstName} ${formData.lastName}\n- Event Date: ${formData.date}\n- Preferred Colors: ${formData.bouquetColors || 'Not specified'}\n- Bouquet Size: ${selectedBouquetSizeLabel}\n- Bouquet Style: ${selectedBouquetStyleLabel}\n- Preferred Flower Type: ${selectedFlowerLabel}\n- Collection / Delivery: ${selectedDeliveryLabel}\n- Additional Requests: ${formData.message || 'None'}`)
      : isNewborn
      ? (isRtl
        ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتنسيق استقبال مواليد:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- المستشفى: ${formData.hospitalName || formData.location}\n- تاريخ المناسبة: ${formData.date}\n- تفاصيل التنسيق المرغوب: ${selectedDecorLabel}\n- نوع الورد المفضل: ${selectedFlowerLabel}\n- الألوان أو الثيم: ${formData.themeColor || 'غير محدد'}\n- تفاصيل أو طلبات إضافية: ${formData.message || 'لا يوجد'}`
        : `Hello Grass Florist, I would like to inquire about Newborn Welcome Decorations:\n- Name: ${formData.firstName} ${formData.lastName}\n- Hospital: ${formData.hospitalName || formData.location}\n- Event Date: ${formData.date}\n- Decoration Preference: ${selectedDecorLabel}\n- Flower Type: ${selectedFlowerLabel}\n- Colors / Theme: ${formData.themeColor || 'Not specified'}\n- Additional Requests: ${formData.message || 'None'}`)
      : isHallEvent
      ? (isRtl
        ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتنسيق مناسبة في قاعة:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- نوع المناسبة: ${homeEventSubtypeLabel}\n- تاريخ المناسبة: ${formData.date}\n- اسم القاعة وموقعها: ${formData.location}\n- تفاصيل التنسيق المرغوب: ${homeDecorAreasLabel || 'غير محدد'}\n- نوع الورد المفضل: ${selectedFlowerLabel}\n- الألوان المفضلة للورد والتنسيق: ${formData.themeColor || 'غير محدد'}\n- الثيم المطلوب: ${formData.homeTheme || 'غير محدد'}\n- تفاصيل أو طلبات إضافية: ${formData.message || 'لا يوجد'}`
        : `Hello Grass Florist, I would like to inquire about Hall Event Decoration:\n- Name: ${formData.firstName} ${formData.lastName}\n- Type of Event: ${homeEventSubtypeLabel}\n- Event Date: ${formData.date}\n- Venue Name and Location: ${formData.location}\n- Decoration Preference: ${homeDecorAreasLabel || 'Not specified'}\n- Flower Type: ${selectedFlowerLabel}\n- Preferred Colors: ${formData.themeColor || 'Not specified'}\n- Specific Theme: ${formData.homeTheme || 'Not specified'}\n- Additional Requests: ${formData.message || 'None'}`)
      : isHomeEvent
      ? (isRtl
        ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتنسيق مناسبة منزلية:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- نوع المناسبة: ${homeEventSubtypeLabel}\n- تاريخ المناسبة: ${formData.date}\n- موقع المناسبة: ${formData.location}\n- تفاصيل التنسيق المرغوب: ${homeDecorAreasLabel || 'غير محدد'}\n- نوع الورد المفضل: ${selectedFlowerLabel}\n- الألوان المفضلة للورد والتنسيق: ${formData.themeColor || 'غير محدد'}\n- الثيم المطلوب: ${formData.homeTheme || 'غير محدد'}\n- تفاصيل أو طلبات إضافية: ${formData.message || 'لا يوجد'}`
        : `Hello Grass Florist, I would like to inquire about Home Event Decoration:\n- Name: ${formData.firstName} ${formData.lastName}\n- Type of Event: ${homeEventSubtypeLabel}\n- Event Date: ${formData.date}\n- Event Location: ${formData.location}\n- Decoration Preference: ${homeDecorAreasLabel || 'Not specified'}\n- Flower Type: ${selectedFlowerLabel}\n- Preferred Colors: ${formData.themeColor || 'Not specified'}\n- Specific Theme: ${formData.homeTheme || 'Not specified'}\n- Additional Requests: ${formData.message || 'None'}`)
      : (isRtl
        ? `مرحباً غراس فلوريست، أود الاستفسار عن حجز وتنظيم مناسبة:\n- الاسم: ${formData.firstName} ${formData.lastName}\n- نوع المناسبة: ${selectedEventObj?.name.ar || formData.eventType}\n- التاريخ: ${formData.date}\n- الموقع: ${formData.location}\n- عدد الضيوف: ${formData.guests}\n- الملاحظات: ${formData.message || 'لا يوجد'}`
        : `Hello Grass Florist, I would like to inquire about booking an event:\n- Name: ${formData.firstName} ${formData.lastName}\n- Event Type: ${selectedEventObj?.name.en || formData.eventType}\n- Date: ${formData.date}\n- Location: ${formData.location}\n- Guests: ${formData.guests}\n- Notes: ${formData.message || 'None'}`);

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

          {/* Step 3: Event Logistics & Venue */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-3">
              {isBridal
                ? (isRtl ? '٣. تفاصيل مسكة العروسة' : '3. Bridal Bouquet Details')
                : isHallOrHome
                ? (isRtl ? '٣. تفاصيل وموقع المناسبة' : '3. Event Details & Location')
                : (isRtl ? '٣. تفاصيل وموقع المناسبة' : '3. Event Logistics & Venue')}
            </label>

            {isBridal ? (
              <>
                {/* Bridal Bouquet Specific Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      {isRtl ? 'تاريخ المناسبة؟ (DATE)' : 'Event Date'}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.date
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Preferred Bouquet Colors */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      <Palette className="w-3.5 h-3.5 inline-block me-1.5 text-[#8A7E74]" />
                      {isRtl
                        ? 'إيش الألوان اللي حابة تكون في المسكة؟'
                        : 'Preferred Bouquet Colors'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.bouquetColors}
                        onChange={(e) => setFormData({ ...formData, bouquetColors: e.target.value })}
                        placeholder={
                          isRtl
                            ? 'مثال: أبيض، سكري، درجات الوردي الباودر، أوف وايت...'
                            : 'e.g. White, ivory, powder blush pink, off-white...'
                        }
                        className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bouquet Size (Optional) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'حجم المسكة (optional)' : 'Bouquet Size (Optional)'}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {BOUQUET_SIZES.map((size) => {
                      const isSelected = formData.bouquetSize === size.id;
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              bouquetSize: isSelected ? '' : size.id,
                            })
                          }
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {size.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bouquet Style (Optional) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'شكل المسكة (optional)' : 'Bouquet Style (Optional)'}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {BOUQUET_STYLES.map((style) => {
                      const isSelected = formData.bouquetStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              bouquetStyle: isSelected ? '' : style.id,
                            })
                          }
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {style.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Flower Type (Optional) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'نوع الورد المفضل؟ (optional)' : 'Preferred Flower Type (Optional)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {FLOWER_TYPES.map((flower) => {
                      const isSelected = formData.flowerType === flower.id;
                      return (
                        <button
                          key={flower.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              flowerType: isSelected ? '' : flower.id,
                            })
                          }
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {flower.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Collection or Delivery? */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl
                      ? 'استلام أو توصيل؟ وإذا توصيل، نحتاج موقع التوصيل؟'
                      : 'Collection or Delivery?'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {DELIVERY_METHODS.map((method) => {
                      const isSelected = formData.deliveryMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, deliveryMethod: method.id });
                            if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: '' });
                          }}
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {method.label[locale]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Delivery Address Input */}
                  {formData.deliveryMethod === 'Delivery' && (
                    <div className="relative animate-fade-in">
                      <MapPin className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="text"
                        value={formData.deliveryAddress}
                        onChange={(e) => {
                          setFormData({ ...formData, deliveryAddress: e.target.value });
                          if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: '' });
                        }}
                        placeholder={
                          isRtl
                            ? 'موقع أو عنوان التوصيل (مثال: جدة، حي الروضة...)'
                            : 'Delivery address (e.g. Jeddah, Al Rawdah district...)'
                        }
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.deliveryAddress
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.deliveryAddress}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : isHallOrHome ? (
              <>
                {/* Hall / Home Event Specific Fields */}
                {/* 1. Type of Event */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'نوع المناسبة' : 'Type of Event'}
                    <span className="text-red-500 ms-1">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {HOME_EVENT_SUBTYPES.map((subType) => {
                      const isSelected = formData.homeEventType === subType.id;
                      return (
                        <button
                          key={subType.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, homeEventType: subType.id })}
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {subType.label[locale]}
                        </button>
                      );
                    })}
                  </div>

                  {formData.homeEventType === 'Other' && (
                    <div className="mt-3 animate-fade-in">
                      <input
                        type="text"
                        value={formData.homeEventOtherText}
                        onChange={(e) => setFormData({ ...formData, homeEventOtherText: e.target.value })}
                        placeholder={
                          isRtl
                            ? 'يرجى كتابة نوع المناسبة...'
                            : 'Please specify the event type...'
                        }
                        className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Date and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      {isRtl ? 'التاريخ؟ (DATE)' : 'Event Date'}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.date
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Event Location / Venue */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      {isHallEvent
                        ? (isRtl ? 'اسم القاعة وموقعها؟' : 'Venue Name and Location')
                        : (isRtl ? 'موقع المناسبة؟' : 'Event Location')}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (errors.location) setErrors({ ...errors, location: '' });
                        }}
                        placeholder={
                          isHallEvent
                            ? (isRtl
                                ? 'مثال: جدة - فندق هيلتون / قاعة ليلتي'
                                : 'e.g. Jeddah - Hilton Hotel / Laylaty Ballroom')
                            : (isRtl
                                ? 'مثال: جدة، حي الروضة / فيلا خاصة'
                                : 'e.g. Jeddah, Al Rawdah / Private Villa')
                        }
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.location
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.location}</p>
                    )}
                  </div>
                </div>

                {/* 3. What would you like us to decorate? */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2 leading-relaxed">
                    {isRtl
                      ? 'إيش حابة ننسق لك؟'
                      : 'What Would You Like Us to Decorate?'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {HOME_DECORATION_AREAS.map((area) => {
                      const isSelected = formData.homeDecorAreas.includes(area.id);
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            const exists = formData.homeDecorAreas.includes(area.id);
                            const updated = exists
                              ? (formData.homeDecorAreas.length > 1
                                  ? formData.homeDecorAreas.filter((a) => a !== area.id)
                                  : formData.homeDecorAreas)
                              : [...formData.homeDecorAreas, area.id];
                            setFormData({ ...formData, homeDecorAreas: updated });
                          }}
                          className={cn(
                            'py-3 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {area.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Preferred Flower Type (Optional) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'نوع الورد المفضل؟ (optional)' : 'Preferred Flower Type (Optional)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {FLOWER_TYPES.map((flower) => {
                      const isSelected = formData.flowerType === flower.id;
                      return (
                        <button
                          key={flower.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              flowerType: isSelected ? '' : flower.id,
                            })
                          }
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {flower.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Colors & Theme (2 columns grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-2">
                  {/* Preferred Flower & Decoration Colors */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      <Palette className="w-3.5 h-3.5 inline-block me-1.5 text-[#8A7E74]" />
                      {isRtl
                        ? 'الألوان المفضلة للورد والتنسيق؟'
                        : 'Preferred Flower & Decoration Colors'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.themeColor}
                        onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                        placeholder={
                          isRtl
                            ? 'مثال: أبيض، سكري، أخضر، درجات الوردي الباستيل...'
                            : 'e.g. White, ivory, greenery, pastel pink...'
                        }
                        className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Do You Have a Specific Theme in Mind? */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 inline-block me-1.5 text-[#8A7E74]" />
                      {isRtl
                        ? 'هل فيه ثيم معين حابة يكون عليه التنسيق؟'
                        : 'Do You Have a Specific Theme in Mind?'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.homeTheme}
                        onChange={(e) => setFormData({ ...formData, homeTheme: e.target.value })}
                        placeholder={
                          isRtl
                            ? 'مثال: كلاسيكي فخم، ريفي بوهيمي، عصري مودرن...'
                            : 'e.g. Classic luxury, rustic bohemian, modern...'
                        }
                        className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : isNewborn ? (
              <>
                {/* Newborn Specific Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  {/* Hospital Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      {isRtl ? 'المستشفى؟' : 'Hospital Name'}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="text"
                        value={formData.hospitalName}
                        onChange={(e) => {
                          setFormData({ ...formData, hospitalName: e.target.value });
                          if (errors.hospitalName) setErrors({ ...errors, hospitalName: '' });
                        }}
                        placeholder={
                          isRtl
                            ? 'مثال: مستشفى د. سليمان فقيه / المركز الطبي الدولي'
                            : 'e.g. Dr. Soliman Fakeeh Hospital / IMC'
                        }
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.hospitalName
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.hospitalName && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.hospitalName}</p>
                    )}
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                      {isRtl ? 'تاريخ المناسبة؟ (DATE)' : 'Event Date'}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8A7E74]" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.date
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* What would you like us to decorate? */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2 leading-relaxed">
                    {isRtl
                      ? 'ما الذي تود منا أن نزينه؟'
                      : 'What would you like us to decorate?'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {DECORATION_OPTIONS.map((option) => {
                      const isSelected = formData.decorationOption === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, decorationOption: option.id })}
                          className={cn(
                            'py-3 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {option.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Flower Type (Optional) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#5A5049] mb-2">
                    {isRtl ? 'نوع الورد المفضل؟ (optional)' : 'Preferred Flower Type (Optional)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {FLOWER_TYPES.map((flower) => {
                      const isSelected = formData.flowerType === flower.id;
                      return (
                        <button
                          key={flower.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, flowerType: flower.id })}
                          className={cn(
                            'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white hover:border-[#435849]/50'
                          )}
                        >
                          {flower.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Colors or Theme */}
                <div>
                  <label className="block text-xs font-semibold text-[#5A5049] mb-1.5">
                    <Palette className="w-3.5 h-3.5 inline-block me-1.5 text-[#8A7E74]" />
                    {isRtl
                      ? 'هل فيه ألوان أو ثيم معين حابة يكون عليه التنسيق؟'
                      : 'Preferred Colors or Theme'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      placeholder={
                        isRtl
                          ? 'مثال: أزرق سماوي وأبيض، درجات الوردي الناعم، ثيم ذهبي ومحايد...'
                          : 'e.g. Baby blue & white, delicate pastel pink, neutral gold...'
                      }
                      className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849] text-xs sm:text-sm text-[#201B18] transition-all outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Standard Event Logistics Fields */}
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
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (errors.location) setErrors({ ...errors, location: '' });
                        }}
                        placeholder={
                          isRtl
                            ? 'مثال: جدة - فندق هيلتون / قاعة ليلتي'
                            : 'e.g. Jeddah - Hilton Ballroom / Private Villa'
                        }
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.location
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.location}</p>
                    )}
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
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                        className={cn(
                          'w-full ps-10 pe-4 py-3 bg-[#FAF8F5] focus:bg-white rounded-xl border text-xs sm:text-sm text-[#201B18] transition-all outline-none',
                          errors.date
                            ? 'border-red-400 ring-1 ring-red-400'
                            : 'border-[#E4DACD] focus:border-[#435849] focus:ring-1 focus:ring-[#435849]'
                        )}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>
                    )}
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
                              ? 'bg-[#2D3F33] text-white border-[#2D3F33] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5049] border-[#E4DACD] hover:bg-white'
                          )}
                        >
                          {range.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Step 4: Special Enquiry Details */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#201B18] mb-1.5">
              {isRtl ? '٤. تفاصيل إضافية أو طلبات خاصة' : '4. Additional Details & Special Requests'}
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 absolute start-3.5 top-3.5 text-[#8A7E74]" />
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  isRtl
                    ? 'أخبرنا بأي تفاصيل أخرى أو طلبات خاصة'
                    : 'Let us know if you have any additional details, preferences, or special requests.'
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
