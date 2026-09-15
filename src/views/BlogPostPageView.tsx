import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { blogPosts } from '@/data/blog';
import { formatDate } from '@/lib/utils';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { Clock, Calendar } from 'lucide-react';

interface BlogPostPageViewProps {
  slug: string;
  locale: Locale;
}

export function BlogPostPageView({ slug, locale }: BlogPostPageViewProps) {
  const dict = getDictionary(locale);

  const post = blogPosts.find((p) => p.slug.ar === slug || p.slug.en === slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.blog.title, href: locale === 'ar' ? '/blog' : '/en/blog' },
    { label: post.title[locale] },
  ];

  const articleSchema = generateArticleSchema(post, locale);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    { name: dict.blog.title, url: locale === 'ar' ? `${siteConfig.url}/blog` : `${siteConfig.url}/en/blog` },
    {
      name: post.title[locale],
      url: locale === 'ar' ? `${siteConfig.url}/blog/${post.slug.ar}` : `${siteConfig.url}/en/blog/${post.slug.en}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="py-6 bg-surface min-h-[80vh]">
        <div className="max-w-[860px] mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          {/* Article Header */}
          <header className="my-8 text-start space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary-light px-3 py-1 rounded-full inline-block">
              {post.category[locale]}
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main leading-tight">
              {post.title[locale]}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border text-xs text-text-muted">
              {/* Author info */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-subtle">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name[locale]}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{post.author.name[locale]}</h4>
                  <p className="text-[11px] text-text-muted">{post.author.role[locale]}</p>
                </div>
              </div>

              {/* Date & Reading time */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.publishedAt, locale)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} {dict.blog.readTime}
                </span>
              </div>
            </div>
          </header>

          {/* Cover Hero Image */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-md my-8">
            <Image
              src={post.coverImage}
              alt={post.title[locale]}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 860px"
              className="object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-sm sm:prose-base max-w-none text-start text-text-secondary leading-relaxed space-y-6 my-10">
            {post.content[locale].split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg sm:text-xl font-bold text-text-main mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-sm sm:text-base leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border text-start">
              <h3 className="text-xl font-bold text-text-main mb-6">
                {dict.blog.relatedArticles}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    href={locale === 'ar' ? `/blog/${r.slug.ar}` : `/en/blog/${r.slug.en}`}
                    className="group block p-4 bg-surface-subtle rounded-2xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                      <Image
                        src={r.coverImage}
                        alt={r.title[locale]}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2">
                      {r.title[locale]}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
