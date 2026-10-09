'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type Locale } from '@/config/site';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { CountrySelect } from '@/components/common/CountrySelect';
import { type CountryItem } from '@/data/countries';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';
import {
  Building2,
  Globe,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  User,
  X,
  Share2,
} from 'lucide-react';

interface PartnerWithUsPageViewProps {
  locale: Locale;
}

const CATEGORIES = [
  { id: 'Chocolates', en: 'Chocolates', ar: 'شوكولاتة' },
  { id: 'Home Accessories', en: 'Home Accessories', ar: 'إكسسوارات منزلية' },
  { id: 'Candles', en: 'Candles', ar: 'شموع' },
  { id: 'Cakes', en: 'Cakes', ar: 'كيك' },
  { id: 'Bakery', en: 'Bakery', ar: 'مخبوزات' },
  { id: 'Sweets', en: 'Sweets', ar: 'حلويات' },
  { id: 'Perfumes', en: 'Perfumes', ar: 'عطور' },
  { id: 'Beauty', en: 'Beauty', ar: 'منتجات تجميل' },
  { id: 'Fashion', en: 'Fashion', ar: 'أزياء' },
  { id: 'Other', en: 'Other', ar: 'أخرى' },
];

const COUNTRIES = [
  { code: '+966', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { code: '+971', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { code: '+965', nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: '+974', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: '+973', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: '+968', nameEn: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { code: '+91', nameEn: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { code: '+1', nameEn: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: '+44', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
];

export function PartnerWithUsPageView({ locale }: PartnerWithUsPageViewProps) {
  const isRtl = locale === 'ar';
  const dispatch = useAppDispatch();

  // Form State
  const [country, setCountry] = useState(isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia');
  const [city, setCity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('Chocolates');
  const [socialMedia, setSocialMedia] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [phone, setPhone] = useState('');

  // File Upload State
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [productListFile, setProductListFile] = useState<File | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const productListInputRef = useRef<HTMLInputElement>(null);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const successContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll smoothly to the success message after submitting
  useEffect(() => {
    if (isSuccess && successContainerRef.current) {
      const yOffset = -100; // Account for sticky navbar
      const y = successContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [isSuccess]);

  const breadcrumbItems = [
    { label: isRtl ? 'الرئيسية' : 'Home', href: isRtl ? '/' : '/en' },
    { label: isRtl ? 'شارك معنا' : 'Partner With Us' },
  ];

  const handleCountryChange = (selected: string, item?: CountryItem) => {
    setCountry(selected);
    const countryObj = COUNTRIES.find((c) => (isRtl ? c.nameAr : c.nameEn) === selected);
    if (countryObj) {
      setCountryCode(countryObj.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!companyName.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال اسم الشركة أو البراند' : 'Company/brand name is required');
      return;
    }
    if (!city.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال المدينة' : 'City is required');
      return;
    }
    if (!firstName.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال الاسم الأول' : 'First name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(isRtl ? 'يرجى إدخال بريد إلكتروني صالح' : 'Valid email is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رقم الهاتف' : 'Phone number is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('country', country);
      formData.append('city', city);
      formData.append('company_name', companyName);
      formData.append('website', website);
      formData.append('category', category);
      formData.append('social_media', socialMedia);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('contact_role', contactRole);
      formData.append('email', email);
      formData.append('country_code', countryCode);
      formData.append('phone', phone);
      formData.append('locale', locale);

      if (profileFile) {
        formData.append('company_profile', profileFile);
      }
      if (productListFile) {
        formData.append('product_list', productListFile);
      }

      const res = await fetch('/api/partner-with-us', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const err = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to submit application');
        throw new Error(err);
      }

      setIsSuccess(true);
      dispatch(
        addToast({
          type: 'success',
          message:
            data?.message ||
            (isRtl
              ? 'تم استلام طلب الشراكة بنجاح!'
              : 'Your partnership application has been received!'),
        })
      );
    } catch (err: any) {
      const msg = err?.message || (isRtl ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' : 'Error submitting form. Please try again.');
      setErrorMsg(msg);
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCity('');
    setCompanyName('');
    setWebsite('');
    setCategory('Chocolates');
    setSocialMedia('');
    setFirstName('');
    setLastName('');
    setContactRole('');
    setEmail('');
    setPhone('');
    setProfileFile(null);
    setProductListFile(null);
    setIsSuccess(false);
    setErrorMsg(null);
  };

  return (
    <div className="py-6 sm:py-10 bg-surface min-h-[85vh]">
      <div className="max-w-[900px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Heading & Subtitle Header */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'شراكات العلامات التجارية' : 'BRAND PARTNERSHIPS'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-3">
            {isRtl ? 'شارك معنا' : 'Partner With Us'}
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            {isRtl
              ? 'هل لديك علامة تجارية مميزة؟ شارك منتجاتك مع غراس فلوريست وتواصل معنا الآن. يرجى تزويدنا بمعلوماتك وسنتواصل معك لمناقشة التفاصيل!'
              : 'Do you have an amazing brand? Expose your product with Grass Florist and contact us now. Please provide us with your info and we will contact you to discuss more!'}
          </p>
        </div>

        {/* Form Container */}
        <div ref={successContainerRef} className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-sm text-start">
          {isSuccess ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-950">
                {isRtl ? 'تم استلام طلب الشراكة بنجاح' : 'Application Received Successfully'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                {isRtl
                  ? 'شكراً لاهتمامكم بالانضمام إلى عائلة شركاء غراس فلوريست. سيقوم فريق الشراكات بمراجعة كتالوج المنتجات والتواصل معكم خلال 2-3 أيام عمل.'
                  : 'Thank you for your interest in joining Grass Florist partners. Our team will review your brand catalogue and reach out within 2-3 business days.'}
              </p>
              <div className="pt-4">
                <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                  {isRtl ? 'تقديم طلب آخر' : 'Submit Another Application'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* SECTION 1: Brand & Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-text-main">
                    {isRtl ? '1. معلومات الشركة والعلامة التجارية' : '1. Company & Brand Information'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'الدولة *' : 'Country *'}
                    </label>
                    <CountrySelect
                      value={country}
                      onChange={(selectedName, item) => handleCountryChange(selectedName, item)}
                      locale={locale}
                      className="p-3 text-xs sm:text-sm bg-surface border-border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'المدينة *' : 'Location City *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: الرياض / جدة' : 'e.g. Riyadh / Jeddah'}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'اسم الشركة / البراند *' : 'Company/brand name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'اسم علامتك التجارية' : 'Your brand name'}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'الموقع الإلكتروني *' : 'Website *'}
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-text-muted absolute start-3 top-3.5" />
                      <input
                        type="url"
                        required
                        placeholder="https://yourbrand.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full ps-9 p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-2">
                    {isRtl ? 'التصنيف *' : 'Category *'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          category === cat.id
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface-subtle text-text-secondary border-border hover:border-primary/50'
                        }`}
                      >
                        {isRtl ? cat.ar : cat.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    {isRtl ? 'حساب التواصل الاجتماعي (إنستغرام / تيك توك)' : 'Social media account'}
                  </label>
                  <div className="relative">
                    <Share2 className="w-4 h-4 text-text-muted absolute start-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="@yourbrand or URL"
                      value={socialMedia}
                      onChange={(e) => setSocialMedia(e.target.value)}
                      className="w-full ps-9 p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Document Uploads */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Upload className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-text-main">
                    {isRtl ? '2. الملفات وكتالوج المنتجات' : '2. Profiles & Product Documents'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Profile Upload */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      {isRtl ? 'بروفايل الشركة / البراند *' : 'Company/brand profile *'}
                    </label>
                    <span className="text-[11px] text-text-muted block mb-2">
                      {isRtl ? '(ملف PDF، Word أو صورة)' : '(PDF, Word, or presentation)'}
                    </span>

                    <input
                      ref={profileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />

                    {profileFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate font-semibold text-text-main">{profileFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfileFile(null)}
                          className="text-text-muted hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="w-full p-4 rounded-xl border border-dashed border-border hover:border-primary bg-surface-subtle/50 text-center transition-colors cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                        <span className="text-xs font-bold text-text-main block">
                          {isRtl ? 'رفع ملف البروفايل' : 'Upload file'}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {isRtl ? 'الحد الأقصى 15 ميجابايت' : 'Max 15MB'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Product List Upload */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      {isRtl ? 'قائمة المنتجات والأسعار *' : 'Product list *'}
                    </label>
                    <span className="text-[11px] text-text-muted block mb-2">
                      {isRtl
                        ? '(ملف PDF أو Excel أو Word) يُرجى تضمين الصور والأسعار'
                        : '(PDF, Excel, or Word) Please include SKUs, images, descriptions, prices'}
                    </span>

                    <input
                      ref={productListInputRef}
                      type="file"
                      required={!productListFile}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(e) => setProductListFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />

                    {productListFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate font-semibold text-text-main">{productListFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProductListFile(null)}
                          className="text-text-muted hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => productListInputRef.current?.click()}
                        className="w-full p-4 rounded-xl border border-dashed border-border hover:border-primary bg-surface-subtle/50 text-center transition-colors cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                        <span className="text-xs font-bold text-text-main block">
                          {isRtl ? 'رفع قائمة المنتجات' : 'Upload file'}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {isRtl ? 'PDF, Excel, Word (حتى 20 ميجابايت)' : 'PDF, Excel, Word (Max 20MB)'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-text-main">
                    {isRtl ? '3. بيانات مسؤول التواصل' : '3. Contact Person Information'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'الاسم الأول *' : 'First name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: محمد' : 'e.g. Alexander'}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'اسم العائلة *' : 'Last name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: الغامدي' : 'e.g. Sterling'}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'المسمى الوظيفي / الدور *' : 'Contact role *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: المدير التنفيذي / مدير المبيعات' : 'e.g. Founder / Sales Director'}
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-muted absolute start-3 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="brand@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full ps-9 p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'رمز الدولة *' : 'Country Code *'}
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                      dir="ltr"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({isRtl ? c.nameAr : c.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-muted absolute start-3 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="5XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full ps-9 p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full py-4 text-sm sm:text-base font-bold shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 me-2 animate-spin" />
                      <span>{isRtl ? 'جارٍ إرسال طلب الشراكة...' : 'Submitting Application...'}</span>
                    </>
                  ) : (
                    <span>{isRtl ? 'إرسال طلب الشراكة' : 'Submit Application'}</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
