'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Loader2, ExternalLink } from 'lucide-react';
import { type ContactPageData, submitContactInquiry } from '@/lib/wordpress/store-api';

function getEmbedMapUrl(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return null;
}

interface ContactPageViewProps {
  locale: Locale;
  contactData?: ContactPageData;
}

export function ContactPageView({ locale, contactData }: ContactPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const contactFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted && contactFormRef.current) {
      const yOffset = -100;
      const y = contactFormRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [submitted]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.nav.contact },
  ];

  // Dynamic values with elegant fallbacks
  const badgeText = contactData?.badge || (locale === 'ar' ? 'نحن في خدمتك' : 'ALWAYS AT YOUR SERVICE');
  const pageTitle = contactData?.title || dict.contact.title;
  const pageSubtitle = contactData?.subtitle || dict.contact.subtitle;
  const formTitle = contactData?.form_title || dict.contact.sendMessage;
  const inquiriesTitle = contactData?.inquiries_title || dict.contact.getInTouch;
  const phoneNumber = contactData?.phone || siteConfig.contact.phone;
  const whatsappNumber = contactData?.whatsapp || siteConfig.contact.whatsapp;
  const contactEmail = contactData?.email || siteConfig.contact.email;
  const workingHours = contactData?.working_hours || (locale === 'ar' ? siteConfig.contact.hours.ar : siteConfig.contact.hours.en);
  const ateliersTitle = contactData?.ateliers_title || dict.contact.boutiqueLocations;
  const cityName = contactData?.city || (locale === 'ar' ? 'جدة' : 'Jeddah');
  const addressText = contactData?.address || (locale === 'ar' ? siteConfig.locations[0].address.ar : siteConfig.locations[0].address.en);
  const mapLink = contactData?.map_link;
  const embedMapUrl = getEmbedMapUrl(
    mapLink ||
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.4146632686343!2d39.1654242!3d21.5697313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d06e1b07c1bf%3A0xc39c5f758fcadf2c!2zR1JBU1Mg2LrYsdin2LM!5e0!3m2!1sen!2sin!4v1791459138205!5m2!1sen!2sin'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const response = await submitContactInquiry({
        name,
        email,
        phone,
        message,
        subject: `Inquiry from ${name}`,
      });

      setSubmitted(true);
      dispatch(
        addToast({
          type: 'success',
          message: response.message || dict.contact.successMsg,
        })
      );
    } catch (err: any) {
      const errorText = err?.message || (locale === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Failed to send inquiry. Please try again.');
      setErrorMsg(errorText);
      dispatch(
        addToast({
          type: 'error',
          message: errorText,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setSubmitted(false);
    setErrorMsg(null);
  };

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="text-center max-w-2xl mx-auto my-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            {badgeText}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
            {pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            {pageSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start my-10">
          {/* Contact Form */}
          <div ref={contactFormRef} className="lg:col-span-7 p-6 sm:p-8 bg-surface rounded-3xl border border-border shadow-xs text-start">
            <h3 className="text-base font-bold text-text-main mb-6">
              {formTitle}
            </h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {locale === 'ar' ? 'تم استلام رسالتك بنجاح' : 'Inquiry Received'}
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {dict.contact.successMsg}
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetForm}
                    className="text-xs font-medium"
                  >
                    {locale === 'ar' ? 'إرسال استفسار آخر' : 'Send Another Inquiry'}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={dict.contact.name}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Input
                    label={dict.contact.email}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <Input
                  label={dict.contact.phone}
                  required
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    {dict.contact.message}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={
                      locale === 'ar'
                        ? 'اكتب استفسارك أو طلبك المخصص هنا...'
                        : 'Write your bespoke request or inquiry here...'
                    }
                    className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none disabled:opacity-60"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 me-2 animate-spin" />
                      <span>{locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{dict.contact.send}</span>
                      <Send className="w-4 h-4 ms-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details & Boutiques */}
          <div className="lg:col-span-5 space-y-6 text-start">
            <div className="p-6 bg-surface-subtle rounded-3xl border border-border space-y-4">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                {inquiriesTitle}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                    className="font-bold text-text-main hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    {phoneNumber}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-text-main hover:text-emerald-700 transition-colors"
                    dir="ltr"
                  >
                    {whatsappNumber} (WhatsApp Concierge)
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-bold text-text-main hover:text-primary transition-colors"
                  >
                    {contactEmail}
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Clock className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-text-muted">
                    {workingHours}
                  </span>
                </div>
              </div>
            </div>

            {/* Boutiques */}
            <div className="p-6 bg-surface rounded-3xl border border-border space-y-3">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">
                {ateliersTitle}
              </h3>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{cityName}</span>
                  </div>
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      {locale === 'ar' ? 'عرض على الخريطة' : 'View on Map'}
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-1 ps-5.5">
                  {addressText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ Full Width Embedded Google Map Section */}
      {embedMapUrl && (
        <section className="mt-12 sm:mt-16 w-full">
          <div className="max-w-[1280px] mx-auto px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-text-main">
                {locale === 'ar' ? 'موقع البوتيك على الخريطة' : 'Boutique Location on Google Maps'}
              </h2>
            </div>
            <a
              href="https://maps.google.com/?q=GRASS+Florist+Jeddah"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              <span>{locale === 'ar' ? 'فتح في خرائط Google' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full h-[315px] sm:h-[365px] lg:h-[420px] relative bg-surface-subtle border-y border-border overflow-hidden shadow-inner">
            <iframe
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={locale === 'ar' ? 'موقع غراس فلوريست' : 'Grass Florist Location'}
              className="w-full h-full"
            />
          </div>
        </section>
      )}
    </div>
  );
}

