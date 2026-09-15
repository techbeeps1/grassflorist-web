import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Button } from '@/components/ui/Button';
import { Sparkles, Clock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface HeroSectionProps {
  locale: Locale;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const flowersUrl = locale === 'ar' ? '/category/flowers' : '/en/category/flowers';
  const luxuryUrl = locale === 'ar' ? '/category/luxury-arrangements' : '/en/category/luxury-arrangements';

  return (
    <section aria-label="Hero Showcase" className="relative overflow-hidden bg-[#FAF8F5] py-8 sm:py-16">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20 shadow-xs">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>{dict.home.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main leading-tight sm:leading-tight">
              {dict.home.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              {dict.home.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href={flowersUrl} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full font-bold shadow-md">
                  <span>{dict.home.heroCta}</span>
                  <ArrowIcon className="w-4 h-4 ms-2" />
                </Button>
              </Link>
              <Link href={luxuryUrl} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full font-bold">
                  <span>{dict.home.heroSecondaryCta}</span>
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-border/60 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-start">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'توصيل خلال ساعتين' : '2-Hour Delivery'}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'سيارات نقل مبردة' : 'Refrigerated Fleet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-start">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'ضمان نضارة 7 أيام' : '7-Day Fresh Guarantee'}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'قطف مزارع معتمدة' : 'Farm-Direct Quality'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80"
                alt={dict.home.heroTitle}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Floating Same-Day Floating Tag */}
              <div className="absolute bottom-4 start-4 end-4 sm:end-auto bg-surface/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-main block">
                    {dict.home.sameDayBadge}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'في الرياض، جدة، والخبر' : 'Across Riyadh, Jeddah, & Khobar'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
