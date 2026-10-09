import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { BlogPost } from '@/types/blog';
import { blogPosts as fallbackBlogPosts } from '@/data/blog';
import { formatDate } from '@/lib/utils';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { Clock, Calendar } from 'lucide-react';

interface BlogPostPageViewProps {
  slug: string;
  locale: Locale;
  post?: BlogPost | null;
  relatedPosts?: BlogPost[];
}

export function BlogPostPageView({
  slug,
  locale,
  post: incomingPost,
  relatedPosts: incomingRelated,
}: BlogPostPageViewProps) {
  const dict = getDictionary(locale);

  const post = incomingPost || fallbackBlogPosts.find((p) => p.slug.ar === slug || p.slug.en === slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = (incomingRelated && incomingRelated.length > 0)
    ? incomingRelated.filter((p) => p.id !== post.id).slice(0, 2)
    : fallbackBlogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const postTitle = post.title[locale] || post.title.en || post.title.ar;
  const postExcerpt = post.excerpt[locale] || post.excerpt.en || post.excerpt.ar;
  const postCategory = post.category[locale] || post.category.en || post.category.ar;
  const postSlug = post.slug[locale] || post.slug.en || post.slug.ar;
  const authorName = post.author?.name?.[locale] || post.author?.name?.en || 'Grass Florist';
  const authorRole = post.author?.role?.[locale] || post.author?.role?.en || 'Master Floral Designer';
  const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const rawContent = post.content[locale] || post.content.en || post.content.ar || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.blog.title, href: locale === 'ar' ? '/blog' : '/en/blog' },
    { label: postTitle },
  ];

  const articleSchema = generateArticleSchema(post, locale);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    { name: dict.blog.title, url: locale === 'ar' ? `${siteConfig.url}/blog` : `${siteConfig.url}/en/blog` },
    {
      name: postTitle,
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
              {postCategory}
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main leading-tight">
              {postTitle}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border text-xs text-text-muted">
              {/* Author info */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-subtle">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    unoptimized
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{authorName}</h4>
                  <p className="text-[11px] text-text-muted">{authorRole}</p>
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
              alt={postTitle}
              fill
              priority
              unoptimized
              sizes="(max-width: 860px) 100vw, 860px"
              className="object-cover"
            />
          </div>

          {/* Article Content */}
          {isHtml ? (
            <div
              className="prose prose-sm sm:prose-base max-w-none text-start text-text-secondary leading-relaxed space-y-6 my-10 prose-headings:text-text-main prose-headings:font-bold prose-p:text-text-secondary prose-a:text-primary hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: rawContent }}
            />
          ) : (
            <div className="prose prose-sm sm:prose-base max-w-none text-start text-text-secondary leading-relaxed space-y-6 my-10">
              {rawContent.split('\n\n').map((paragraph, idx) => {
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
          )}

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border text-start">
              <h3 className="text-xl font-bold text-text-main mb-6">
                {dict.blog.relatedArticles}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((r) => {
                  const relSlug = r.slug[locale] || r.slug.en || r.slug.ar;
                  const relTitle = r.title[locale] || r.title.en || r.title.ar;
                  return (
                    <Link
                      key={r.id}
                      href={locale === 'ar' ? `/blog/${relSlug}` : `/en/blog/${relSlug}`}
                      className="group block p-4 bg-surface-subtle rounded-2xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                        <Image
                          src={r.coverImage}
                          alt={relTitle}
                          fill
                          unoptimized
                          sizes="400px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2">
                        {relTitle}
                      </h4>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
