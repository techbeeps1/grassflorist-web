import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { blogPosts } from '@/data/blog';
import { formatDate } from '@/lib/utils';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface BlogListingPageViewProps {
  locale: Locale;
}

export function BlogListingPageView({ locale }: BlogListingPageViewProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const featuredPost = blogPosts[0];
  const remainingPosts = blogPosts.slice(1);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.blog.title },
  ];

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="text-center max-w-2xl mx-auto my-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            {locale === 'ar' ? 'أدلة وثقافة زهرية' : 'THE BOTANICAL JOURNAL'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
            {dict.blog.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {dict.blog.subtitle}
          </p>
        </div>

        {/* Featured Article Banner */}
        {featuredPost && (
          <div className="my-10">
            <Link
              href={
                locale === 'ar'
                  ? `/blog/${featuredPost.slug.ar}`
                  : `/en/blog/${featuredPost.slug.en}`
              }
              className="group grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 bg-surface-subtle rounded-3xl border border-border hover:shadow-hover transition-all duration-300 text-start"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title[locale]}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-light px-2.5 py-1 rounded-full inline-block">
                    {featuredPost.category[locale]}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-bold text-text-main group-hover:text-primary transition-colors leading-snug">
                    {featuredPost.title[locale]}
                  </h2>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {featuredPost.excerpt[locale]}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-surface">
                      <Image
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name[locale]}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-text-main">
                      {featuredPost.author.name[locale]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime} {dict.blog.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Remaining Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 my-12">
          {remainingPosts.map((post) => {
            const postUrl =
              locale === 'ar' ? `/blog/${post.slug.ar}` : `/en/blog/${post.slug.en}`;

            return (
              <Link
                key={post.id}
                href={postUrl}
                className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 text-start"
              >
                <div className="relative aspect-[16/10] bg-surface-subtle overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title[locale]}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 start-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-surface/90 backdrop-blur-xs text-text-main px-2.5 py-1 rounded-full shadow-xs">
                      {post.category[locale]}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title[locale]}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {post.excerpt[locale]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                    <span>{formatDate(post.publishedAt, locale)}</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <span>{dict.common.readMore}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
