'use client';

import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { faqs } from '@/data/faqs';
import { generateFaqSchema } from '@/lib/schema';

interface FaqPageViewProps {
  locale: Locale;
}

export function FaqPageView({ locale }: FaqPageViewProps) {
  const dict = getDictionary(locale);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.faq.title },
  ];

  const faqSchema = generateFaqSchema(faqs, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-6 bg-surface min-h-[80vh]">
        <div className="max-w-[900px] mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          <div className="text-center my-8 md:my-10">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
              {locale === 'ar' ? 'مركز المساعدة والإرشادات' : 'HELP & GUIDANCE'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
              {dict.faq.title}
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl mx-auto">
              {dict.faq.subtitle}
            </p>
          </div>

          {/* Accordion Component */}
          {faqs.length > 0 ? (
            <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-7 md:p-8 border border-[#EFE7DC] shadow-sm mb-12">
              <Accordion
                variant="card"
                items={faqs.map((f) => ({
                  id: f.id,
                  title: f.question[locale],
                  content: f.answer[locale],
                }))}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

