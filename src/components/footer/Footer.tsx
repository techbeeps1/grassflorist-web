'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { categories } from '@/data/categories';
import { getCategorySlugForLocale, type DynamicFooterData } from '@/lib/wordpress/store-api';
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowUp,
} from 'lucide-react';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [footerData, setFooterData] = useState<DynamicFooterData | null>(null);
  const { data: globalSettings } = useGetGlobalSettingsQuery();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && data?.success && data.footer) {
          const raw = data.footer;
          const settings = data.footer_settings || raw.settings || {};
          const normalized: DynamicFooterData = {
            column_1: raw.column_1 ? {
              title: {
                en: raw.column_1.title?.en || raw.column_1.title_en || 'CATEGORIES',
                ar: raw.column_1.title?.ar || raw.column_1.title_ar || 'التصنيفات',
              },
              categories: (raw.column_1.categories || []).map((c: any) => ({
                id: String(c.id || Math.random()),
                name: {
                  en: c.name?.en || c.name_en || '',
                  ar: c.name?.ar || c.name_ar || '',
                },
                href: {
                  en: c.href?.en || c.url_en || '#',
                  ar: c.href?.ar || c.url_ar || '#',
                },
              })),
            } : undefined,
            column_2: raw.column_2 ? {
              title: {
                en: raw.column_2.title?.en || raw.column_2.title_en || 'QUICK LINKS',
                ar: raw.column_2.title?.ar || raw.column_2.title_ar || 'روابط سريعة',
              },
              links: (raw.column_2.links || []).map((l: any) => ({
                id: String(l.id || Math.random()),
                name: {
                  en: l.name?.en || l.name_en || '',
                  ar: l.name?.ar || l.name_ar || '',
                },
                href: {
                  en: l.href?.en || l.url_en || '#',
                  ar: l.href?.ar || l.url_ar || '#',
                },
              })),
            } : undefined,
            column_3: raw.column_3 ? {
              title: {
                en: raw.column_3.title?.en || raw.column_3.title_en || 'POLICIES',
                ar: raw.column_3.title?.ar || raw.column_3.title_ar || 'السياسات',
              },
              links: (raw.column_3.links || []).map((l: any) => ({
                id: String(l.id || Math.random()),
                name: {
                  en: l.name?.en || l.name_en || '',
                  ar: l.name?.ar || l.name_ar || '',
                },
                href: {
                  en: l.href?.en || l.url_en || '#',
                  ar: l.href?.ar || l.url_ar || '#',
                },
              })),
            } : undefined,
            settings: {
              delivery_city: {
                en: settings.delivery_city?.en || settings.delivery_city_en || 'Jeddah',
                ar: settings.delivery_city?.ar || settings.delivery_city_ar || 'جدة',
              },
              delivery_badge: {
                en: settings.delivery_badge?.en || settings.delivery_badge_en || 'Delivery to',
                ar: settings.delivery_badge?.ar || settings.delivery_badge_ar || 'التوصيل إلى',
              },
            },
          };
          setFooterData(normalized);
        }
      })
      .catch((e) => console.warn('[Footer] Failed to fetch footer:', e));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getUrl = (path: string) => (locale === 'ar' ? path : `/en${path}`);

  return (
    <>
      {/* 1. SEPARATE VIP NEWSLETTER SECTION (Clean, attractive & visually appealing) */}
      <section
        aria-label="Newsletter Subscription"
        className="w-full bg-[#FAF7F2] border-t border-[#EAE2D5] py-14 sm:py-16 relative overflow-hidden"
      >
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-0 end-0 w-96 h-96 bg-[#8CA841]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#D4C4B5]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="site-container relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-5 sm:p-8 md:p-12 border border-[#E8DFC0]/80 shadow-[0_10px_35px_rgba(40,30,20,0.04)] text-center flex flex-col items-center">
            {/* VIP Club Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] text-[#435849] border border-[#DDD3C6] text-[11px] font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8CA841]" />
              <span>{locale === 'ar' ? 'نادي غراس للتميز والإهداء' : 'GRASS VIP BOTANICAL CLUB'}</span>
            </div>

            {/* Headline & Subtitle */}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E1915] leading-tight mb-2.5">
              {dict.home.newsletterTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#6B5E52] max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8">
              {dict.home.newsletterSubtitle}
            </p>

            {/* Newsletter Input Form */}
            <div className="w-full max-w-xl">
              {subscribed ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-[#F2F7F3] border border-[#435849]/30 rounded-full text-xs sm:text-sm font-semibold text-[#435849] shadow-xs animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-[#435849] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <span>{dict.home.newsletterSuccess}</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="relative flex items-center bg-[#FAF8F5] rounded-full p-1 sm:p-1.5 border border-[#D5C6B5] shadow-xs hover:border-[#435849]/50 focus-within:border-[#435849] focus-within:ring-3 focus-within:ring-[#435849]/15 transition-all w-full"
                >
                  <div className="flex items-center flex-1 min-w-0 ps-3 sm:ps-4 pe-1">
                    <Mail className="w-4 h-4 text-[#8C7A6B] shrink-0 me-2 opacity-80" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                      className="w-full h-10 sm:h-11 text-xs sm:text-sm bg-transparent !border-0 !border-none !outline-none text-[#1E1915] placeholder:text-[#91857A] !shadow-none !ring-0 focus:!outline-none focus:!ring-0 focus:!border-none"
                      style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="group shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#435849] hover:bg-[#2D3F33] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    <span>{dict.home.newsletterButton}</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                      <Send className="w-2.5 h-2.5 rtl:rotate-180" />
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Minimal Trust Perks Footer */}
            <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-[11px] font-medium text-[#8C8075]">
              <span>🔒 {locale === 'ar' ? 'بدون رسائل مزعجة، يمكنك إلغاء الاشتراك في أي وقت' : 'No spam, unsubscribe anytime'}</span>
              <span className="hidden sm:inline">•</span>
              <span>🌸 {locale === 'ar' ? 'نصائح حصرية للعناية بالزهور أسبوعياً' : 'Weekly floral care guides'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN LUXURY DARK FOOTER (Floward-Style Structure & Hierarchy) */}
      <footer className="bg-[#493D25] text-[#D1C9BE] pt-16 sm:pt-20 pb-10 sm:pb-12 border-t border-[#233227]">
        <div className="site-container">
          {/* Main Content Grid: Left Brand Block + Right Link Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            {/* Left Side: Brand Logo, Bio, Contact & Social Media */}
            <div className="lg:col-span-4 space-y-6">
              {/* Brand Logo */}
              <Link href={getUrl('/')} className="inline-flex items-center group">
                <div className="p-2.5 bg-white rounded-2xl shadow-md border border-white/20 transition-transform group-hover:scale-105 shrink-0">
                  <Image
                    src={globalSettings?.branding?.site_logo_dark || globalSettings?.branding?.site_logo || '/grass-logo.jpg'}
                    alt={globalSettings?.branding?.site_name?.[locale] || 'Grass غراس'}
                    width={90}
                    height={54}
                    unoptimized={(globalSettings?.branding?.site_logo_dark || globalSettings?.branding?.site_logo || '').startsWith('http')}
                    className="w-[75px] sm:w-[85px] h-auto object-contain rounded-lg"
                  />
                </div>
              </Link>

              {/* Brand Description */}
              <p className="text-sm text-white leading-relaxed max-w-sm">
                {globalSettings?.footer?.about?.[locale] || dict.footer.aboutBrand}
              </p>

              {/* Contact Information */}
              <div className="space-y-2.5 text-sm text-white pt-1">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#99C552] shrink-0 mt-0.5" />
                  <span>
                    {globalSettings?.contact?.address?.[locale] ||
                      (locale === 'ar'
                        ? '4366 شارع الكيال، حي الروضة، جدة 23434، المملكة العربية السعودية'
                        : '4366 Al Kayyal Street, Al-Rawdah District, Jeddah 23434, Saudi Arabia')}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#99C552] shrink-0" />
                  <a
                    href={`tel:${(globalSettings?.contact?.phone || siteConfig.contact.phone).replace(/\s+/g, '')}`}
                    className="hover:text-[#99C552] transition-colors font-medium text-white"
                    dir="ltr"
                  >
                    {globalSettings?.contact?.phone || siteConfig.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#99C552] shrink-0" />
                  <a
                    href={`mailto:${globalSettings?.contact?.email || siteConfig.contact.email}`}
                    className="hover:text-[#99C552] transition-colors font-medium text-white"
                  >
                    {globalSettings?.contact?.email || siteConfig.contact.email}
                  </a>
                </div>
              </div>

              {/* Social Media Circular Badges (Floward Style) */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 block">
                  {locale === 'ar' ? 'تابعنا على وسائل التواصل' : 'Social Media'}
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Facebook */}
                  <a
                    href={globalSettings?.social?.facebook || siteConfig.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  {/* X (Twitter) */}
                  <a
                    href={globalSettings?.social?.twitter || siteConfig.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a
                    href={globalSettings?.social?.instagram || siteConfig.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={globalSettings?.social?.whatsapp || (globalSettings?.contact?.whatsapp ? ('https://wa.me/' + globalSettings.contact.whatsapp.replace(/[^0-9]/g, '')) : siteConfig.socials.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                  {/* Snapchat */}
                  <a
                    href={globalSettings?.social?.snapchat || siteConfig.socials.snapchat}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Snapchat"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.002 0c-4.464 0-7.391 3.195-7.391 6.84 0 .977.26 1.954.521 2.585.088.21.037.452-.128.613-.509.497-1.458.74-2.825 1.139-.368.107-.638.423-.679.803-.042.381.144.75.474.945.892.527 1.838.937 2.062 1.579.117.337-.021.737-.367 1.097-.732.76-1.57 1.341-2.488 1.728-.364.153-.598.513-.585.908.012.395.27.736.643.854 1.637.521 3.123 1.258 4.298 2.133.456.341.977.625 1.554.846.335.128.536.48.49.837-.089.689-.251 1.464-.53 2.046-.226.47-.075 1.036.353 1.339.429.304 1.009.28 1.408-.057 1.042-.88 2.193-1.123 3.39-1.123 1.196 0 2.348.243 3.39 1.123.399.337.979.361 1.408.057.428-.303.579-.869.353-1.339-.279-.582-.441-1.357-.53-2.046-.046-.357.155-.709.49-.837.577-.221 1.098-.505 1.554-.846 1.175-.875 2.661-1.612 4.298-2.133.373-.118.631-.459.643-.854.013-.395-.221-.755-.585-.908-.918-.387-1.756-.968-2.488-1.728-.346-.36-.484-.76-.367-1.097.224-.642 1.17-1.052 2.062-1.579.33-.195.516-.564.474-.945-.041-.38-.311-.696-.679-.803-1.367-.399-2.316-.642-2.825-1.139-.165-.161-.216-.403-.128-.613.261-.631.521-1.608.521-2.585C19.393 3.195 16.466 0 12.002 0z" />
                    </svg>
                  </a>
                  {/* TikTok */}
                  {globalSettings?.social?.tiktok && (
                    <a
                      href={globalSettings.social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.33V9.17a8.28 8.28 0 0 0 4.85 1.57v-3.5a4.84 4.84 0 0 1-.94-.55z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: 3 Organized Columns of Links + Bottom Location & Language Pills */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Column 1: Categories / Explore */}
                <div className="space-y-3.5">
                  <h4 className=" text-lg font-bold uppercase tracking-widest text-white">
                    {footerData?.column_1?.title?.[locale] || (locale === 'ar' ? (footerData?.column_1 as any)?.title_ar : (footerData?.column_1 as any)?.title_en) || dict.footer.categories}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-white">
                    {footerData?.column_1?.categories && footerData.column_1.categories.length > 0 ? (
                      footerData.column_1.categories.map((cat: any) => {
                        const name = (typeof cat.name === 'object' ? cat.name?.[locale] : cat.name) ||
                          (locale === 'ar' ? cat.name_ar : cat.name_en) ||
                          cat.name_en ||
                          cat.name_ar ||
                          '';
                        const href = (typeof cat.href === 'object' ? cat.href?.[locale] : cat.href) ||
                          (locale === 'ar' ? cat.url_ar : cat.url_en) ||
                          cat.url_en ||
                          cat.url_ar ||
                          '#';
                        if (!name) return null;
                        return (
                          <li key={cat.id || name}>
                            <Link
                              href={href}
                              className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })
                    ) : (
                      categories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            href={
                              locale === 'ar'
                                ? `/category/${getCategorySlugForLocale(cat.slug, 'ar')}`
                                : `/en/category/${getCategorySlugForLocale(cat.slug, 'en')}`
                            }
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {cat.name[locale]}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Column 2: Quick Links / About Us */}
                <div className="space-y-3.5">
                  <h4 className=" text-lg font-bold uppercase tracking-widest text-white">
                    {footerData?.column_2?.title?.[locale] || (locale === 'ar' ? (footerData?.column_2 as any)?.title_ar : (footerData?.column_2 as any)?.title_en) || dict.footer.quickLinks}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-white">
                    {footerData?.column_2?.links && footerData.column_2.links.length > 0 ? (
                      footerData.column_2.links.map((link: any) => {
                        const name = (typeof link.name === 'object' ? link.name?.[locale] : link.name) ||
                          (locale === 'ar' ? link.name_ar : link.name_en) ||
                          link.name_en ||
                          link.name_ar ||
                          '';
                        const href = (typeof link.href === 'object' ? link.href?.[locale] : link.href) ||
                          (locale === 'ar' ? link.url_ar : link.url_en) ||
                          link.url_en ||
                          link.url_ar ||
                          '#';
                        if (!name) return null;
                        return (
                          <li key={link.id || name}>
                            <Link
                              href={href}
                              className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })
                    ) : (
                      <>
                        <li>
                          <Link href={getUrl('/products')} className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150">
                            {dict.nav.allProducts}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/عن-غراس' : '/en/about'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.nav.about}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/حجز-مناسبة' : '/en/event-booking'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150 text-white font-medium"
                          >
                            {locale === 'ar' ? ' حجز وتنظيم مناسبة' : 'Event & Wedding Booking'}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/شارك-معنا' : '/en/partner-with-us'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150 text-white font-medium"
                          >
                            {locale === 'ar' ? 'انضم كشريك معنا' : 'Partner With Us'}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/المدونة' : '/en/blog'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.nav.blog}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/اتصل-بنا' : '/en/contact'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.nav.contact}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/الأسئلة-الشائعة' : '/en/faq'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.nav.faq}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/المفضلة' : '/en/wishlist'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.wishlist.title}
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Column 3: Customer Service & Policies */}
                <div className="space-y-3.5">
                  <h4 className=" text-lg font-bold uppercase tracking-widest text-white">
                    {footerData?.column_3?.title?.[locale] || (locale === 'ar' ? (footerData?.column_3 as any)?.title_ar : (footerData?.column_3 as any)?.title_en) || dict.footer.policies}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-white">
                    {footerData?.column_3?.links && footerData.column_3.links.length > 0 ? (
                      footerData.column_3.links.map((link: any) => {
                        const name = (typeof link.name === 'object' ? link.name?.[locale] : link.name) ||
                          (locale === 'ar' ? link.name_ar : link.name_en) ||
                          link.name_en ||
                          link.name_ar ||
                          '';
                        const href = (typeof link.href === 'object' ? link.href?.[locale] : link.href) ||
                          (locale === 'ar' ? link.url_ar : link.url_en) ||
                          link.url_en ||
                          link.url_ar ||
                          '#';
                        if (!name) return null;
                        return (
                          <li key={link.id || name}>
                            <Link
                              href={href}
                              className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })
                    ) : (
                      <>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/privacy-policy' : '/en/privacy-policy'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.policies.privacyTitle}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/terms-conditions' : '/en/terms-conditions'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.policies.termsTitle}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/shipping-policy' : '/en/shipping-policy'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.policies.shippingTitle}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={locale === 'ar' ? '/return-policy' : '/en/return-policy'}
                            className="hover:text-[#99C552] hover:translate-x-1 rtl:hover:-translate-x-1 inline-block transition-all duration-150"
                          >
                            {dict.policies.returnsTitle}
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom Right Control Bar: Delivery Badge + Language Switcher (Floward Style) */}
              <div className="pt-8 sm:pt-10 flex items-center justify-start sm:justify-end gap-3 flex-wrap">
                {/* Delivery City Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/90 shadow-2xs backdrop-blur-xs">
                  <span>
                    {footerData?.settings?.delivery_badge?.[locale] || (locale === 'ar' ? 'التوصيل إلى' : 'Delivery to')}
                  </span>
                  <span className="font-bold text-[#99C552]">
                    🇸🇦 {footerData?.settings?.delivery_city?.[locale] || (locale === 'ar' ? 'جدة' : 'Jeddah')}
                  </span>
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher
                  currentLocale={locale}
                  className="border-white/15 bg-white/5 text-white hover:border-[#99C552] hover:bg-white/10 hover:text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. BOTTOM BAR (Copyright, Terms Links, Payment Icons & Back to top) */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-white">
            {/* Copyright info */}
            <div className="text-center md:text-start">
              <p>{globalSettings?.footer?.copyright?.[locale] || dict.footer.allRightsReserved}</p>
            </div>



            {/* Payment Method Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center flex-wrap gap-1.5 justify-center md:justify-end">
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
                    className="h-7 sm:h-7.5 px-2 bg-white  border border-white/20 shadow-xs flex items-center justify-center hover:scale-105 transition-all"
                    title={pm.name}
                  >
                    <img
                      src={pm.src}
                      alt={pm.name}
                      className="h-3.5 sm:h-4 w-auto max-w-[42px] object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Fixed Scroll-To-Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={locale === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
        className={`fixed bottom-5 end-4 sm:bottom-7 sm:end-7 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1E2E23]/95 hover:bg-[#99C552] text-white hover:text-[#121B14] border border-white/20 flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer hover:scale-110 active:scale-95 backdrop-blur-md ${showScrollTop
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
}
