'use client';

import React, { useState } from 'react';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

interface ContactPageViewProps {
  locale: Locale;
}

export function ContactPageView({ locale }: ContactPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.nav.contact },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    dispatch(
      addToast({
        type: 'success',
        message: dict.contact.successMsg,
      })
    );
  };

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="text-center max-w-2xl mx-auto my-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            {locale === 'ar' ? 'نحن في خدمتك' : 'ALWAYS AT YOUR SERVICE'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
            {dict.contact.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {dict.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start my-10">
          {/* Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-surface rounded-3xl border border-border shadow-xs text-start">
            <h3 className="text-base font-bold text-text-main mb-6">
              {dict.contact.sendMessage}
            </h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {locale === 'ar' ? 'تم استلام رسالتك بنجاح' : 'Inquiry Received'}
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {dict.contact.successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={dict.contact.name}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label={dict.contact.email}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Input
                  label={dict.contact.phone}
                  required
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                    placeholder={
                      locale === 'ar'
                        ? 'اكتب استفسارك أو طلبك المخصص هنا...'
                        : 'Write your bespoke request or inquiry here...'
                    }
                    className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
                  <span>{dict.contact.send}</span>
                  <Send className="w-4 h-4 ms-2" />
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details & Boutiques */}
          <div className="lg:col-span-5 space-y-6 text-start">
            <div className="p-6 bg-surface-subtle rounded-3xl border border-border space-y-4">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                {dict.contact.getInTouch}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                    className="font-bold text-text-main hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-text-main hover:text-emerald-700 transition-colors"
                    dir="ltr"
                  >
                    {siteConfig.contact.whatsapp} (WhatsApp Concierge)
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="font-bold text-text-main hover:text-primary transition-colors"
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Clock className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-text-muted">
                    {locale === 'ar' ? siteConfig.contact.hours.ar : siteConfig.contact.hours.en}
                  </span>
                </div>
              </div>
            </div>

            {/* Boutiques */}
            <div className="p-6 bg-surface rounded-3xl border border-border space-y-3">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">
                {dict.contact.boutiqueLocations}
              </h3>

              {siteConfig.locations.map((loc) => (
                <div key={loc.id} className="p-3 rounded-xl bg-surface-subtle border border-border/60">
                  <div className="flex items-center gap-2 font-bold text-xs text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{locale === 'ar' ? loc.name.ar : loc.name.en}</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 ps-5.5">
                    {locale === 'ar' ? loc.address.ar : loc.address.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
