'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { categories } from '@/data/categories';
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const getUrl = (path: string) => (locale === 'ar' ? path : `/en${path}`);

  return (
    <footer className="bg-[#EFE7DC] text-[#25211E] pt-16 pb-12">
      <div className="site-container">
        {/* Newsletter VIP Banner */}
        <div className="bg-gradient-to-r from-[#FAF3ED] via-[#F4ECE2] to-[#EAE0D3] rounded-3xl p-6 sm:p-10 mb-16 shadow-sm border border-[#E4D8CB] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-start">
            <span className="text-primary text-xs font-bold uppercase tracking-widest block mb-1">
              {locale === 'ar' ? 'نادي غراس للتميز والإهداء' : 'GRASS VIP BOTANICAL CLUB'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#25211E] mb-2">
              {dict.home.newsletterTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed">
              {dict.home.newsletterSubtitle}
            </p>
          </div>

          <div className="w-full md:w-[460px] shrink-0">
            {subscribed ? (
              <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-white/95 border border-[#435849]/30 rounded-full text-xs sm:text-sm font-semibold text-[#435849] shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#435849]" />
                </div>
                <span>{dict.home.newsletterSuccess}</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="relative flex items-center bg-white rounded-full p-1.5 border border-[#D5C6B5] shadow-xs hover:border-[#435849]/40 focus-within:border-[#435849] focus-within:ring-2 focus-within:ring-[#435849]/15 transition-all w-full"
              >
                <div className="flex items-center flex-1 min-w-0 ps-3.5 pe-2">
                  <Mail className="w-4 h-4 text-[#8C6D58] shrink-0 me-2.5 opacity-75" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.home.newsletterPlaceholder}
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-transparent border-0 text-[#201B18] placeholder:text-[#8C8075] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group shrink-0 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#435849] hover:bg-[#344539] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all duration-200 active:scale-95 whitespace-nowrap flex-nowrap cursor-pointer"
                >
                  <span>{dict.home.newsletterButton}</span>
                  <span className="w-5 h-5 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors">
                    <Send className="w-2.5 h-2.5 rtl:rotate-180" />
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[#E4D8CB]">
          {/* Brand & About Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href={getUrl('/')} className="flex items-center gap-3 group">
              <div className="relative ">
                <Image
                  src="/grass-logo.jpg"
                  alt="Grass غراس"
                  width={100}
                  height={60}
                  className="w-[80px]"
                />
              </div>
            </Link>
            <p className="text-xs text-[#5C524B] leading-relaxed max-w-sm">
              {dict.footer.aboutBrand}
            </p>

            {/* Contact details */}
            <div className="space-y-2 pt-2 text-xs text-[#5C524B]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {locale === 'ar'
                    ? '4366 شارع الكيال، حي الروضة، جدة 23434، المملكة العربية السعودية'
                    : '4366 Al Kayyal Street, Al-Rawdah District, Jeddah 23434, Saudi Arabia'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-primary transition-colors font-medium"
                  dir="ltr"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-primary transition-colors font-medium"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Collections Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#25211E]">
              {dict.footer.categories}
            </h4>
            <ul className="space-y-2 text-xs text-[#5C524B]">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={getUrl(`/category/${cat.slug}`)}
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {cat.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#25211E]">
              {dict.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#5C524B]">
              <li>
                <Link href={getUrl('/products')} className="hover:text-primary transition-colors">
                  {dict.nav.allProducts}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/about')} className="hover:text-primary transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/blog')} className="hover:text-primary transition-colors">
                  {dict.nav.blog}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/contact')} className="hover:text-primary transition-colors">
                  {dict.nav.contact}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/faq')} className="hover:text-primary transition-colors">
                  {dict.nav.faq}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/wishlist')} className="hover:text-primary transition-colors">
                  {dict.wishlist.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#25211E]">
              {dict.footer.policies}
            </h4>
            <ul className="space-y-2 text-xs text-[#5C524B]">
              <li>
                <Link href={getUrl('/policies/privacy')} className="hover:text-primary transition-colors">
                  {dict.policies.privacyTitle}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/policies/terms')} className="hover:text-primary transition-colors">
                  {dict.policies.termsTitle}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/policies/shipping')} className="hover:text-primary transition-colors">
                  {dict.policies.shippingTitle}
                </Link>
              </li>
              <li>
                <Link href={getUrl('/policies/returns')} className="hover:text-primary transition-colors">
                  {dict.policies.returnsTitle}
                </Link>
              </li>
            </ul>

            <div className="pt-4">
              <span className="text-[11px] text-[#25211E] font-bold uppercase block mb-2">
                {locale === 'ar' ? 'تغيير لغة العرض' : 'Change Language'}
              </span>
              <LanguageSwitcher currentLocale={locale} className="border-[#E4D8CB] bg-white text-[#25211E]" />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8075]">
          <p>{dict.footer.allRightsReserved}</p>

          {/* Individual Payment Badges */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-end">
            {[
              { name: 'mada', src: '/payments/mada-logo.svg' },
              { name: 'Visa', src: '/payments/visa.svg' },
              { name: 'Mastercard', src: '/payments/mastercard.svg' },
              { name: 'American Express', src: '/payments/amex.svg' },
              { name: 'Tabby', src: '/payments/tabby.svg' },
              { name: 'stc pay', src: '/payments/stcpay.svg' },
              { name: 'Apple Pay', src: '/payments/applepay.svg' },
              { name: 'Tamara', src: '/payments/tamara.svg' },
              { name: 'PayPal', src: '/payments/paypal.svg' },
            ].map((pm) => (
              <div
                key={pm.name}
                className="h-7 sm:h-8 px-2 bg-white rounded-md border border-[#E4D8CB] shadow-xs flex items-center justify-center hover:border-[#435849]/50 hover:shadow-sm transition-all"
                title={pm.name}
              >
                <img
                  src={pm.src}
                  alt={pm.name}
                  className="h-4 sm:h-4.5 w-auto max-w-[44px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
