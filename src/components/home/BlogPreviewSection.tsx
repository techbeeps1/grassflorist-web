'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/data/blog';
import { type Locale } from '@/config/site';
import { BookOpen, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface BlogPreviewSectionProps {
  locale: Locale;
}

export function BlogPreviewSection({ locale }: BlogPreviewSectionProps) {
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const blogListingUrl = locale === 'ar' ? '/blog' : '/en/blog';

  const previewPosts = blogPosts.slice(0, 3);

  return (
    <section aria-label="Floral Journal" className="py-14 sm:py-20 bg-white">
      <div className="site-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
              {locale === 'ar' ? 'إلهام وأسرار العناية بالزهور' : 'Floral Inspiration & Care Guides'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5049] mt-1.5">
              {locale === 'ar'
                ? 'مقالات حصرية من خبراء تنسيق الزهور لإرشادك في اختيار الهدية المثالية والحفاظ على نضارتها.'
                : 'Curated articles from master florists to guide your gifting choices and prolong bloom life.'}
            </p>
          </div>

          <Link
            href={blogListingUrl}
            className="group hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#FAF5EE] hover:bg-[#2D3F33] text-[#1E1915] hover:text-white border border-[#DDD3C6] hover:border-[#2D3F33] shadow-xs hover:shadow-md text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <span>{locale === 'ar' ? 'عرض جميع المقالات' : 'Read All Stories'}</span>
            <span className="w-6 h-6 rounded-full bg-[#2D3F33] group-hover:bg-white text-white group-hover:text-[#2D3F33] flex items-center justify-center transition-colors shrink-0 ms-1">
              <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {previewPosts.map((post) => {
            const postUrl =
              locale === 'ar'
                ? `/blog/${post.slug.ar}`
                : `/en/blog/${post.slug.en}`;

            return (
              <article
                key={post.id}
                className="group flex flex-col bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xs hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <Link href={postUrl} className="relative aspect-[16/10] w-full overflow-hidden block">
                  <Image
                    src={post.coverImage}
                    alt={post.title[locale]}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#435849] shadow-xs">
                    {post.category[locale]}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-[#877C74] mb-2.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'قراءة ٤ دقائق' : '4 min read'}</span>
                    </div>

                    <Link href={postUrl}>
                      <h3 className="text-sm sm:text-base font-bold text-[#201B18] group-hover:text-[#435849] transition-colors line-clamp-2 leading-snug mb-2">
                        {post.title[locale]}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#5A5049] line-clamp-3 leading-relaxed">
                      {post.excerpt[locale]}
                    </p>
                  </div>

                  {/* Footer Author & Read Link */}
                  <div className="mt-5 pt-4 border-t border-[#EFE6DB] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#E2D5C4]">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name[locale]}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#201B18]">
                        {post.author.name[locale]}
                      </span>
                    </div>

                    <Link
                      href={postUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#435849] hover:text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
                    >
                      <span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read'}</span>
                      <ArrowIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile View All Stories Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={blogListingUrl}
            className="group inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 text-xs sm:text-sm font-bold text-[#1E1915] hover:text-white bg-[#FAF5EE] hover:bg-[#2D3F33] border border-[#DDD3C6] hover:border-[#2D3F33] rounded-full shadow-xs transition-all duration-300"
          >
            <span>{locale === 'ar' ? 'عرض جميع المقالات' : 'Read All Stories'}</span>
            <span className="w-6 h-6 rounded-full bg-[#2D3F33] group-hover:bg-white text-white group-hover:text-[#2D3F33] flex items-center justify-center transition-colors shrink-0 ms-1">
              <ArrowIcon className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
