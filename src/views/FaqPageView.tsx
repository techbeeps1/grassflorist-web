'use client';

import React, { useState, useMemo } from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { faqs } from '@/data/faqs';
import { generateFaqSchema } from '@/lib/schema';
import { Search } from 'lucide-react';

interface FaqPageViewProps {
  locale: Locale;
}

export function FaqPageView({ locale }: FaqPageViewProps) {
  const dict = getDictionary(locale);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: dict.faq.allFaqs },
    { id: 'ordering', label: dict.faq.ordering },
    { id: 'delivery', label: dict.faq.delivery },
    { id: 'flowerCare', label: dict.faq.flowerCare },
    { id: 'payments', label: dict.faq.payments },
  ];

  const filteredFaqs = useMemo(() => {
    let result = [...faqs];

    if (activeCategory !== 'all') {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.ar.toLowerCase().includes(q) ||
          f.question.en.toLowerCase().includes(q) ||
          f.answer.ar.toLowerCase().includes(q) ||
          f.answer.en.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.faq.title },
  ];

  const faqSchema = generateFaqSchema(filteredFaqs, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-6 bg-surface min-h-[80vh]">
        <div className="max-w-[900px] mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          <div className="text-center my-8">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
              {locale === 'ar' ? 'مركز المساعدة والإرشادات' : 'HELP & GUIDANCE'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
              {dict.faq.title}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl mx-auto">
              {dict.faq.subtitle}
            </p>

            {/* Search Input */}
            <div className="relative max-w-md mx-auto mt-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.faq.searchPlaceholder}
                className="w-full h-11 ps-10 pe-4 text-xs sm:text-sm bg-surface-subtle border border-border rounded-full focus:outline-none focus:border-primary"
              />
              <Search className="w-4 h-4 text-text-muted absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2 mb-8">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-subtle text-text-secondary hover:bg-surface border border-border'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Accordion Component */}
          {filteredFaqs.length > 0 ? (
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
              <Accordion
                items={filteredFaqs.map((f) => ({
                  id: f.id,
                  title: f.question[locale],
                  content: f.answer[locale],
                }))}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-text-muted">
              {locale === 'ar'
                ? 'لم يتم العثور على نتائج تطابق بحثك.'
                : 'No frequently asked questions match your inquiry.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
