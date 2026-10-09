'use client';

import React, { useState, useMemo } from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { faqs as fallbackFaqs } from '@/data/faqs';
import { generateFaqSchema } from '@/lib/schema';
import { FAQItem } from '@/types/faq';
import { Search, Sparkles, HelpCircle } from 'lucide-react';

interface FaqPageViewProps {
  locale: Locale;
  faqs?: FAQItem[];
}

export function FaqPageView({ locale, faqs: initialFaqs }: FaqPageViewProps) {
  const dict = getDictionary(locale);
  const activeFaqs = initialFaqs && initialFaqs.length > 0 ? initialFaqs : fallbackFaqs;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.faq.title },
  ];

  // Extract unique categories
  const categories = useMemo(() => {
    const list: string[] = [];
    activeFaqs.forEach((f) => {
      const cat = f.category;
      if (cat && !list.includes(cat)) {
        list.push(cat);
      }
    });
    return list;
  }, [activeFaqs]);

  // Filter FAQs based on selected category & search query
  const filteredFaqs = useMemo(() => {
    return activeFaqs.filter((f) => {
      const matchesCategory =
        selectedCategory === 'all' || f.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = typeof f.question === 'object'
        ? (f.question[locale] || f.question.en || f.question.ar || '')
        : String(f.question || '');
      const a = typeof f.answer === 'object'
        ? (f.answer[locale] || f.answer.en || f.answer.ar || '')
        : String(f.answer || '');

      const term = searchQuery.toLowerCase().trim();
      return q.toLowerCase().includes(term) || a.toLowerCase().includes(term);
    });
  }, [activeFaqs, selectedCategory, searchQuery, locale]);

  const faqSchema = generateFaqSchema(activeFaqs, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-8 bg-surface min-h-[80vh]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          {/* Header */}
          <div className="text-center my-8 md:my-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#435849] border border-[#EAE3D7] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8CA841]" />
              <span>{locale === 'ar' ? 'مركز المساعدة والإرشادات' : 'HELP & FLORAL GUIDANCE'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1915] mb-3 tracking-tight">
              {dict.faq.title}
            </h1>
            <p className="text-sm sm:text-base text-[#6B5E52] leading-relaxed max-w-xl mx-auto">
              {dict.faq.subtitle}
            </p>

            {/* Search Input */}
            <div className="mt-6 max-w-md mx-auto relative">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C827A] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.faq.searchPlaceholder || (locale === 'ar' ? 'ابحث في الأسئلة الشائعة...' : 'Search FAQs...')}
                  className="w-full ps-11 pe-4 py-3 bg-white border border-[#E5DACD] focus:border-[#2D3F33] focus:ring-2 focus:ring-[#2D3F33]/15 rounded-full text-sm text-[#1E1915] placeholder-[#8C827A] shadow-xs outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1E1915] bg-[#EFE7DC] rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-[#2D3F33] text-white shadow-sm'
                      : 'bg-white hover:bg-[#FAF5EE] text-[#5A5049] border border-[#E5DACD]'
                  }`}
                >
                  {dict.faq.allFaqs || (locale === 'ar' ? 'جميع الأسئلة' : 'All Topics')} ({activeFaqs.length})
                </button>
                {categories.map((cat) => {
                  const count = activeFaqs.filter((f) => f.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-[#2D3F33] text-white shadow-sm'
                          : 'bg-white hover:bg-[#FAF5EE] text-[#5A5049] border border-[#E5DACD]'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accordion List (Shows ALL FAQs by default) */}
          {filteredFaqs.length > 0 ? (
            <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-7 md:p-9 border border-[#EFE7DC] shadow-sm mb-16">
              <Accordion
                variant="card"
                items={filteredFaqs.map((f, idx) => ({
                  id: f.id || `faq-${idx}`,
                  title:
                    typeof f.question === 'object'
                      ? (f.question[locale] || f.question.en || f.question.ar || '')
                      : String(f.question || ''),
                  content:
                    typeof f.answer === 'object'
                      ? (f.answer[locale] || f.answer.en || f.answer.ar || '')
                      : String(f.answer || ''),
                }))}
              />
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-3xl border border-[#EFE7DC] mb-16">
              <HelpCircle className="w-12 h-12 text-[#B8AA99] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1E1915]">
                {locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No matching questions found'}
              </p>
              <p className="text-sm text-[#7D7065] mt-1">
                {locale === 'ar' ? 'جرب البحث بكلمات أخرى أو اختر جميع التصنيفات' : 'Try searching with different keywords or reset your filter'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-5 py-2 bg-[#2D3F33] text-white text-xs sm:text-sm font-bold rounded-full hover:bg-[#1E1915] transition-all"
              >
                {locale === 'ar' ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
